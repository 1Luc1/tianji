import { useQuery } from '@tanstack/react-query';
import { DateUnit } from '../../utils/date';
import { queryClient } from '../cache';
import { request } from '../request';
import { getUserTimezone } from './user';
import { AppRouterOutput } from '../trpc';

export type WebsiteInfo = NonNullable<AppRouterOutput['website']['info']>;

export async function deleteWorkspaceWebsite(
  workspaceId: string,
  websiteId: string
) {
  await request.delete(`/api/workspace/${workspaceId}/website/${websiteId}`);

  queryClient.resetQueries(['websites', workspaceId]);
}

export function refreshWorkspaceWebsites(workspaceId: string) {
  queryClient.refetchQueries(['websites', workspaceId]);
}

export async function getWorkspaceWebsitePageview(
  workspaceId: string,
  websiteId: string,
  filter: Record<string, any>
) {
  const { data } = await request.get(
    `/api/workspace/${workspaceId}/website/${websiteId}/pageviews`,
    {
      params: {
        ...filter,
      },
    }
  );

  return data;
}

export function useWorkspaceWebsitePageview(
  workspaceId: string,
  websiteId: string,
  startAt: number,
  endAt: number,
  unit: DateUnit
) {
  const { data, isLoading, refetch } = useQuery(
    ['websitePageview', { workspaceId, websiteId, startAt, endAt }],
    () => {
      return getWorkspaceWebsitePageview(workspaceId, websiteId, {
        startAt,
        endAt,
        unit,
        timezone: getUserTimezone(),
      });
    }
  );

  return {
    pageviews: data?.pageviews ?? [],
    sessions: data?.sessions ?? [],
    isLoading,
    refetch,
  };
}
