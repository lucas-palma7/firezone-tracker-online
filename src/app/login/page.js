'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Login() {
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('fz_user');
    if (savedUser) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      isAdmin: false
    };

    localStorage.setItem('fz_user', JSON.stringify(newUser));
    router.push('/');
  };

  return (
    <div className="login-container">
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
          background: #f5f5f5;
          padding: 20px;
        }
        .login-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
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
        }
        .subtitle {
          color: #666;
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
          border: 2px solid #eee;
          font-size: 16px;
          transition: border-color 0.2s;
          outline: none;
          text-align: center;
        }
        input:focus {
          border-color: #000;
        }
        button {
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #000;
          color: white;
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
