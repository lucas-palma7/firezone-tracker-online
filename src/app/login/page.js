/**
 * Login page component
 * @module app/login/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { createUser, saveUser, getUser } from '@/services/auth.service';

/**
 * Login page component
 * Allows users to enter their name and create/retrieve their account
 * Automatically redirects if user is already logged in
 * 
 * @returns {JSX.Element} Login page
 */
export default function Login() {
  const [name, setName] = useState('');
  const router = useRouter();

  /**
   * Check if user is already logged in on mount
   * Redirect to home if user exists in localStorage
   */
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      router.push('/');
    }
  }, [router]);

  /**
   * Handles login form submission
   * Creates a new user and saves to localStorage
   * @param {React.FormEvent} e - Form submit event
   */
  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser = createUser(name);
    saveUser(newUser);
    router.push('/');
  };

  return (
    <div className="login-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg"
          alt="Botafogo"
          className="bfr-logo"
        />
        <h1>Firezone Tracker</h1>
        <p className="subtitle">Insira seu nome para continuar</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!name.trim()}>
            Entrar
          </button>
        </form>
      </motion.div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: var(--bg-page);
          padding: 20px;
          position: relative;
        }
        .theme-toggle-wrapper {
          position: absolute;
          top: 20px;
          right: 20px;
        }
        .login-card {
          background: var(--bg-card);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid var(--border-color);
        }
        .bfr-logo {
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
          text-align: center;
          width: 100%;
          color: var(--text-primary);
        }
        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-weight: 500;
          text-align: center;
          width: 100%;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        input {
          padding: 16px;
          border-radius: 12px;
          border: 2px solid var(--input-border);
          font-size: 16px;
          transition: border-color 0.2s;
          outline: none;
          text-align: center;
          background: var(--input-bg);
          color: var(--text-primary);
        }
        input:focus {
          border-color: var(--text-primary);
        }
        button {
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
