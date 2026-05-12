"use client";
import React, { useState } from 'react';
import { Package, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Invalid credentials');
      }
    } catch (e) {
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-leaf rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-leaf/20">
            <Package size={32} />
          </div>
          <h1 className="font-display font-bold text-2xl">SpiceVeg Admin</h1>
          <p className="text-stone-400 text-sm mt-1">Sign in to manage seed labels</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-600 mb-1 block">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field" 
              placeholder="Enter username" 
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-1 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              placeholder="••••••••" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-8 text-[10px] text-stone-300 uppercase tracking-widest">
          Secure Internal Access Only
        </p>
      </div>
    </div>
  );
}
