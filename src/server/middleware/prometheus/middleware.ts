import Prometheus from 'prom-client';
import { SetupOptions } from './types.js';
import { Request, Response, NextFunction } from 'express';
import * as utils from './utils.js';

export class ExpressMiddleware {
  constructor(public setupOptions: SetupOptions) {}

  _collectDefaultServerMetrics(timeout: number) {
    const NUMBER_OF_CONNECTIONS_METRICS_NAME =
      'expressjs_number_of_open_connections';
    this.setupOptions.numberOfConnectionsGauge =
      Prometheus.register.getSingleMetric(NUMBER_OF_CONNECTIONS_METRICS_NAME) ||
      new Prometheus.Gauge({
        name: NUMBER_OF_CONNECTIONS_METRICS_NAME,
        help: 'Number of open connections to the Express.js server',
      });
    if (this.setupOptions.server) {
      setInterval(this._getConnections.bind(this), timeout).unref();
    }
  }

  _getConnections() {
    if (this.setupOptions && this.setupOptions.server) {
      this.setupOptions.server.getConnections((error: any, count: any) => {
        if (error) {
          // debug('Error while collection number of open connections', error);
        } else {
          this.setupOptions.numberOfConnectionsGauge.set(count);
        }
      });
    }
  }

  _handleResponse(req: Request, res: Response) {
    const responseLength = parseInt(res.get('Content-Length')!) || 0;

    const route = this._getRoute(req);

    if (
      route &&
      utils.shouldLogMetrics(this.setupOptions.excludeRoutes!, route)
    ) {
      const labels = {
        method: req.method,
        route,
        code: res.statusCode,
        ...this.setupOptions.extractAdditionalLabelValuesFn!(req, res),
      };
      this.setupOptions.requestSizeHistogram.observe(
        labels,
        (req as any).metrics.contentLength
      );
      (req as any).metrics.timer(labels);
      this.setupOptions.responseSizeHistogram.observe(labels, responseLength);
    }
  }

  _getRoute(req: Request) {
    let route = req.baseUrl;
    if (req.route) {
      if (req.route.path !== '/') {
        route = route ? route + req.route.path : req.route.path;
      }

      if (!route || route === '' || typeof route !== 'string') {
        route = req.originalUrl.split('?')[0];
      } else {
        const splittedRoute = route.split('/');
        const splittedUrl = req.originalUrl.split('?')[0].split('/');
        const routeIndex = splittedUrl.length - splittedRoute.length + 1;

        const baseUrl = splittedUrl.slice(0, routeIndex).join('/');
        route = baseUrl + route;
      }

      if (
        this.setupOptions.includeQueryParams === true &&
        Object.keys(req.query).length > 0
      ) {
        route = `${route}?${Object.keys(req.query)
          .sort()
          .map((queryParam) => `${queryParam}=<?>`)
          .join('&')}`;
      }
    }

    // nest.js - build request url pattern if exists
    if (typeof req.params === 'object') {
      Object.keys(req.params).forEach((paramName) => {
        route = route.replace(req.params[paramName], ':' + paramName);
      });
    }

    // this condition will evaluate to true only in
    // express framework and no route was found for the request. if we log this metrics
    // we'll risk in a memory leak since the route is not a pattern but a hardcoded string.
    if (!route || route === '') {
      // if (!req.route && res && res.statusCode === 404) {
      route = 'N/A';
    }

    return route;
  }

  async middleware(req: Request, res: Response, next: NextFunction) {
    if (!this.setupOptions.server && req.socket) {
      this.setupOptions.server = (req.socket as any).server;
      this._collectDefaultServerMetrics(
        this.setupOptions.defaultMetricsInterval as any
      );
    }

    const routeUrl = req.originalUrl || req.url;

    if (routeUrl === this.setupOptions.metricsRoute) {
      res.set('Content-Type', Prometheus.register.contentType);
      return res.end(await Prometheus.register.metrics());
    }
    if (routeUrl === `${this.setupOptions.metricsRoute}.json`) {
      return res.json(await Prometheus.register.getMetricsAsJSON());
    }

    (req as any).metrics = {
      timer: (this.setupOptions as any).responseTimeHistogram.startTimer(),
      contentLength: parseInt(req.get('content-length')!) || 0,
    } as any;

    res.once('finish', () => {
      this._handleResponse(req, res);
    });

    return next();
  }
}
