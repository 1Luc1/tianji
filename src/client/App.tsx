import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Website } from './pages/Website';
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

export const AppRoutes: React.FC = React.memo(() => {
  const { info } = useUserStore();

  return (
    <Routes>
      {info ? (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitor/*" element={<MonitorPage />} />
          <Route path="/website" element={<Website />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Route>
      ) : (
        <Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
  return (
    <div className="App">
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TokenLoginContainer>
              <AppRoutes />
            </TokenLoginContainer>
          </BrowserRouter>
        </QueryClientProvider>
      </trpc.Provider>
    </div>
  );
});
App.displayName = 'App';
