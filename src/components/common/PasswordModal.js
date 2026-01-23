/**
 * Password modal component for admin authentication
 * @module components/common/PasswordModal
 */

'use client';

import { useState } from 'react';

/**
 * Modal dialog for entering admin password
 * Supports Enter key submission and click-outside-to-close
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {() => void} props.onClose - Callback function when modal is closed
 * @param {(password: string) => void} props.onSuccess - Callback function when password is submitted
 * @returns {JSX.Element | null} Password modal or null if not open
 * 
 * @example
 * <PasswordModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={(password) => verifyPassword(password)}
 * />
 */
export default function PasswordModal({ isOpen, onClose, onSuccess }) {
    const [password, setPassword] = useState('');

    // Don't render anything if modal is not open
    if (!isOpen) return null;

    /**
     * Handles password submission
     * Clears the password field after submission
     */
    const handleSubmit = () => {
        onSuccess(password);
        setPassword('');
    };

    /**
     * Handles Enter key press in the password input
     * @param {React.KeyboardEvent} e - Keyboard event
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Senha Admin</h3>
                <input
                    type="password"
                    placeholder="Digite a senha..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <div className="modal-actions">
                    <button className="btn-confirm" onClick={handleSubmit}>
                        Confirmar
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-card);
          padding: 20px;
          border-radius: 12px;
          width: 90%;
          max-width: 300px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 15px;
          text-align: center;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--input-border);
          border-radius: 8px;
          margin-bottom: 15px;
          box-sizing: border-box;
          font-size: 16px;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .modal-actions {
          display: flex;
          gap: 10px;
        }

        button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-confirm {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
        }

        .btn-cancel {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-text);
        }
      `}</style>
        </div>
    );
}
