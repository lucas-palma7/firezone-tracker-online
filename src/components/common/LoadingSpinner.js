/**
 * Loading spinner component
 * @module components/common/LoadingSpinner
 */

'use client';

/**
 * Simple loading spinner component displayed while app initializes
 * 
 * @returns {JSX.Element} Loading spinner
 * 
 * @example
 * if (loading) return <LoadingSpinner />;
 */
export default function LoadingSpinner() {
    return (
        <div className="loading">
            Carregando...
            <style jsx>{`
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: var(--text-secondary);
          font-size: 16px;
        }
      `}</style>
        </div>
    );
}
