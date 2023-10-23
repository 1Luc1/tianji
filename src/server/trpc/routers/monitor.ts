import { router, workspaceOwnerProcedure, workspaceProcedure } from '../trpc';
import { prisma } from '../../model/_client';
import { z } from 'zod';
import { monitorManager } from '../../model/monitor';
import { MonitorInfoWithNotificationIds } from '../../../types';
import dayjs from 'dayjs';

export const monitorRouter = router({
  all: workspaceProcedure.query(async ({ input }) => {
    const workspaceId = input.workspaceId;
    const monitors = await prisma.monitor.findMany({
      where: {
        workspaceId,
      },
      include: {
        notifications: {
          select: {
            id: true,
          },
        },
      },
    });

    return monitors as MonitorInfoWithNotificationIds[];
  }),
  get: workspaceProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      })
    )
    .query(async ({ input }) => {
      const { id, workspaceId } = input;
      const monitor = await prisma.monitor.findUnique({
        where: {
          id,
          workspaceId,
        },
        include: {
          notifications: {
            select: {
              id: true,
            },
          },
        },
      });

      return monitor as MonitorInfoWithNotificationIds;
    }),
  upsert: workspaceOwnerProcedure
    .input(
      z.object({
        id: z.string().cuid2().optional(),
        name: z.string(),
        type: z.string(),
        active: z.boolean().default(true),
        interval: z.number().int().default(20),
        notificationIds: z.array(z.string()).default([]),
        payload: z.object({}).passthrough(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        id,
        workspaceId,
        name,
        type,
        active,
        interval,
        notificationIds,
        payload,
      } = input;

      const monitor = await monitorManager.upsert({
        id,
        workspaceId,
        name,
        type,
        active,
        interval,
        notificationIds,
        payload,
      });

      return monitor;
    }),
  data: workspaceProcedure
    .input(
      z.object({
        monitorId: z.string().cuid2(),
        startAt: z.number(),
        endAt: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { monitorId, workspaceId, startAt, endAt } = input;

      return prisma.monitorData.findMany({
        where: {
          monitor: {
            id: monitorId,
            workspaceId,
          },
          createdAt: {
            gte: new Date(startAt),
            lte: new Date(endAt),
          },
        },
        select: {
          value: true,
          createdAt: true,
        },
      });
    }),
  recentData: workspaceProcedure
    .input(
      z.object({
        monitorId: z.string().cuid2(),
        take: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { monitorId, take } = input;

      return prisma.monitorData.findMany({
        where: {
          monitorId,
        },
        take: -take,
        select: {
          value: true,
          createdAt: true,
        },
      });
    }),
  dataMetrics: workspaceProcedure
    .input(
      z.object({
        monitorId: z.string().cuid2(),
      })
    )
    .query(async ({ input }) => {
      const { monitorId } = input;
      const now = dayjs();

      const [
        recent1DayAvg,
        recent1DayOnlineCount,
        recent1DayOfflineCount,
        recent30DayOnlineCount,
        recent30DayOfflineCount,
      ] = await Promise.all([
        prisma.monitorData
          .aggregate({
            _avg: {
              value: true,
            },
            where: {
              monitorId,
              createdAt: {
                lte: now.toDate(),
                gte: now.subtract(1, 'day').toDate(),
              },
            },
          })
          .then((res) => res._avg.value ?? -1),
        prisma.monitorData.count({
          where: {
            monitorId,
            createdAt: {
              lte: now.toDate(),
              gte: now.subtract(1, 'day').toDate(),
            },
            value: {
              gte: 0,
            },
          },
        }),
        prisma.monitorData.count({
          where: {
            monitorId,
            createdAt: {
              lte: now.toDate(),
              gte: now.subtract(1, 'day').toDate(),
            },
            value: -1,
          },
        }),
        prisma.monitorData.count({
          where: {
            monitorId,
            createdAt: {
              lte: now.toDate(),
              gte: now.subtract(30, 'day').toDate(),
            },
            value: {
              gte: 0,
            },
          },
        }),
        prisma.monitorData.count({
          where: {
            monitorId,
            createdAt: {
              lte: now.toDate(),
              gte: now.subtract(30, 'day').toDate(),
            },
            value: -1,
          },
        }),
      ]);

      return {
        recent1DayAvg,
        recent1DayOnlineCount,
        recent1DayOfflineCount,
        recent30DayOnlineCount,
        recent30DayOfflineCount,
      };
    }),
  events: workspaceProcedure
    .input(
      z.object({
        monitorId: z.string().cuid2().optional(),
      })
    )
    .query(async ({ input }) => {
      const { monitorId } = input;

      const list = await prisma.monitorEvent.findMany({
        where: {
          monitorId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      return list;
    }),
  getStatus: workspaceProcedure
    .input(
      z.object({
        monitorId: z.string().cuid2(),
        statusName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { monitorId, statusName } = input;

      return prisma.monitorStatus.findUnique({
        where: {
          monitorId_statusName: {
            monitorId,
            statusName,
          },
        },
      });
    }),
});
