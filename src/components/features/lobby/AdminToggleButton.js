/**
 * Admin toggle button component
 * @module components/features/lobby/AdminToggleButton
 */

'use client';

/**
 * Button that toggles admin mode on/off
 * Visual indicator changes based on admin status
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether user is currently in admin mode
 * @param {() => void} props.onClick - Callback when button is clicked
 * @returns {JSX.Element} Admin toggle button
 * 
 * @example
 * <AdminToggleButton isAdmin={user.isAdmin} onClick={toggleAdmin} />
 */
export default function AdminToggleButton({ isAdmin, onClick }) {
    return (
        <button className={`btn-admin-login ${isAdmin ? 'is-logged' : ''}`} onClick={onClick}>
            {isAdmin ? '✅ Admin Logado' : '🔑 Acesso Admin'}

            <style jsx>{`
        .btn-admin-login {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 12px;
          margin: 0 auto;
          font-weight: 600;
          display: block;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-admin-login.is-logged {
          background: var(--success-bg);
          color: var(--success-text);
          border-color: var(--success-border);
        }

        .btn-admin-login:hover {
          transform: translateY(-1px);
        }
      `}</style>
        </button>
    );
}
