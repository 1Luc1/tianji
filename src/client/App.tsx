import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Monitor } from './pages/Monitor';
import { Website } from './pages/Website';
import { Settings } from './pages/Settings';
import { Servers } from './pages/Servers';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/website" element={<Website />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace={true} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
