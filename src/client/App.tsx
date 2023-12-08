import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { DashboardPage } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SettingsPage } from './pages/Settings';
import { Servers } from './pages/Servers';
import { useUserStore } from './store/user';
import { Register } from './pages/Register';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/cache';
import { TokenLoginContainer } from './components/TokenLoginContainer';
import React from 'react';
import { trpc, trpcClient } from './api/trpc';
import { MonitorPage } from './pages/Monitor';
import { WebsitePage } from './pages/Website';
import { useGlobalConfig } from './hooks/useConfig';
import { useInjectWebsiteScript } from './hooks/useInjectWebsiteScript';
import { ConfigProvider, theme } from 'antd';
import { useGlobalStateStore } from './store/global';
import clsx from 'clsx';

export const AppRoutes: React.FC = React.memo(() => {
  const { info } = useUserStore();
  const { allowRegister } = useGlobalConfig();

  useInjectWebsiteScript();

  return (
    <Routes>
      {info ? (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/monitor/*" element={<MonitorPage />} />
          <Route path="/website/*" element={<WebsitePage />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Route>
      ) : (
        <Route>
          <Route path="/login" element={<Login />} />
          {allowRegister && <Route path="/register" element={<Register />} />}
        </Route>
      )}

      <Route
        path="*"
        element={
          <Navigate to={info ? '/dashboard' : '/login'} replace={true} />
        }
      />
    </Routes>
  );
});
AppRoutes.displayName = 'AppRoutes';

export const App: React.FC = React.memo(() => {
  const colorScheme = useGlobalStateStore((state) => state.colorScheme);
  const algorithm =
    colorScheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <div
      className={clsx('App', {
        dark: colorScheme === 'dark',
      })}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ConfigProvider theme={{ algorithm }}>
              <TokenLoginContainer>
                <AppRoutes />
              </TokenLoginContainer>
            </ConfigProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </trpc.Provider>
    </div>
  );
});
App.displayName = 'App';
