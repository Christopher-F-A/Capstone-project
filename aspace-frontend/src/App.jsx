import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      {/* CONTENITORE DELLO SFONDO FLUIDO GLOBALE */}
      <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-slate-950 via-indigo-950/70 to-slate-950 animate-fluid-bg selection:bg-indigo-500/30">

        {/* COPRICAPO LUCI FLUTTUANTI IN TRASPARENZA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        {/* LE ROTTE (Il contenuto cambia qui sopra, lo sfondo sotto resta immobile e fluido) */}
        <div className="relative z-10 w-full min-h-screen">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />}
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;