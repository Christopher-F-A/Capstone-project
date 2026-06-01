import React, { useState } from 'react';
import { login, register } from '../api/authService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Stato per switchare tra Login e Registrazione
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Per la registrazione
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        window.location.href = '/dashboard';
      } else {
        // CHIAMATA REALE AL BACKEND
        await register(username, email, password);
        alert("Registrazione completata con successo! Ora puoi accedere.");
        setIsLogin(true); // Ti sposta automaticamente sul form di login
        setPassword('');  // Pulisce la password per sicurezza
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // RIMOSSO bg-slate-950 e sfere duplicate: ora lo sfondo fluido di App.jsx attraversa anche il login
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">

      {/* Card principale ad effetto Liquid Glass */}
      <div className="relative max-w-md w-full mx-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-widest text-white">
            A<span className="text-indigo-400 font-semibold">-</span>SPACE
          </h2>
          <p className="mt-2 text-xs text-slate-400 uppercase tracking-widest">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </p>
        </div>

        {/* Alert di errore */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs text-center font-medium backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Form unico responsivo */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Campo Username (Mostrato solo in registrazione) */}
          {!isLogin && (
            <div className="transition-all duration-300">
              <label className="block text-xs font-medium text-slate-300 mb-1 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-sm transition-all backdrop-blur-sm"
                placeholder="Il tuo username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          {/* Campo Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-sm transition-all backdrop-blur-sm"
              placeholder="nome@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-sm transition-all backdrop-blur-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Pulsante di Azione principale */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Switcher inferiore */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium underline transition-all bg-transparent border-none cursor-pointer"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}