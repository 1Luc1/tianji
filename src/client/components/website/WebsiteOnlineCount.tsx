import React from 'react';
import { trpc } from '../../api/trpc';

export const WebsiteOnlineCount: React.FC<{
  workspaceId: string;
  websiteId: string;
}> = React.memo((props) => {
  const { workspaceId, websiteId } = props;

  const { data: count } = trpc.website.onlineCount.useQuery({
    workspaceId,
    websiteId,
  });

  if (typeof count === 'number' && count > 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span>{count} current visitor</span>
      </div>
    );
  }

  return null;
});
WebsiteOnlineCount.displayName = 'WebsiteOnlineCount';
