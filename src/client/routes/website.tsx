import { trpc } from '@/api/trpc';
import { CommonHeader } from '@/components/CommonHeader';
import { CommonList } from '@/components/CommonList';
import { CommonWrapper } from '@/components/CommonWrapper';
import { Button } from '@/components/ui/button';
import { useDataReady } from '@/hooks/useDataReady';
import { useEvent } from '@/hooks/useEvent';
import { Layout } from '@/components/layout';
import { useCurrentWorkspaceId } from '@/store/user';
import { routeAuthBeforeLoad } from '@/utils/route';
import { cn } from '@/utils/style';
import { useTranslation } from '@i18next-toolkit/react';
import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { LuEye, LuPlus } from 'react-icons/lu';

export const Route = createFileRoute('/website')({
  beforeLoad: routeAuthBeforeLoad,
  component: WebsiteComponent,
});

function WebsiteComponent() {
  const workspaceId = useCurrentWorkspaceId();
  const { t } = useTranslation();
  const { data = [], isLoading } = trpc.website.all.useQuery({
    workspaceId,
  });
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const items = data.map((item) => ({
    id: item.id,
    title: item.name,
    content: item.domain,
    href: `/website/${item.id}`,
  }));

  useEffect(() => {
    if (pathname === Route.fullPath) {
      navigate({
        to: '/website/overview',
      });
    }
  }, []);

  const handleClickOverview = useEvent(() => {
    navigate({
      to: '/website/overview',
    });
  });

  const handleClickAdd = useEvent(() => {
    navigate({
      to: '/website/add',
    });
  });

  return (
    <Layout
      list={
        <CommonWrapper
          header={
            <CommonHeader
              title={t('Website')}
              actions={
                <div className="space-x-2">
                  <Button
                    className={cn(
                      pathname === '/website/overview' && '!bg-muted'
                    )}
                    variant="outline"
                    Icon={LuEye}
                    onClick={handleClickOverview}
                  >
                    {t('Overview')}
                  </Button>
                  <Button
                    className={cn(pathname === '/website/add' && '!bg-muted')}
                    variant="outline"
                    size="icon"
                    Icon={LuPlus}
                    onClick={handleClickAdd}
                  />
                </div>
              }
            />
          }
        >
          <CommonList hasSearch={true} items={items} isLoading={isLoading} />
        </CommonWrapper>
      }
    />
  );
}
