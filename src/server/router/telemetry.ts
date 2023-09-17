import { Router } from 'express';
import { query, validate } from '../middleware/validate';
import { recordTelemetryEvent, sumTelemetryEvent } from '../model/telemetry';
import { numify } from '../utils/common';
const openBadge = require('openbadge');

export const telemetryRouter = Router();

telemetryRouter.get(
  '/:workspaceId/blank.gif',
  validate(
    query('name').optional().isString(),
    query('url').optional().isURL()
  ),
  async (req, res) => {
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    recordTelemetryEvent(req);

    res.header('Content-Type', 'image/gif').send(buffer);
  }
);

telemetryRouter.get(
  '/:workspaceId/badge.svg',
  validate(
    query('name').optional().isString(),
    query('url').optional().isURL()
  ),
  async (req, res) => {
    const title = req.query.title || 'visitor';
    const start = req.query.start ? Number(req.query.start) : 0;

    recordTelemetryEvent(req);
    const num = await sumTelemetryEvent(req);

    const svg = await new Promise((resolve, reject) => {
      openBadge(
        {
          text: [title, numify(num + start)],
        },
        (err: any, badgeSvg: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(badgeSvg);
          }
        }
      );
    });

    res.header('Content-Type', 'image/svg+xml').send(svg);
  }
);
