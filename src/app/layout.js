/**
 * Root layout component for the application
 * @module app/layout
 */

import './globals.css'
import { ThemeProvider } from './ThemeProvider'

/**
 * Metadata for the application
 * Used by Next.js for SEO and browser tab information
 */
export const metadata = {
  title: 'Firezone Hub',
  description: 'Tracker de comandas online para o Firezone',
  icons: {
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg',
  },
}

/**
 * Viewport configuration
 * Optimized for mobile devices with fixed scaling
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

/**
 * Root layout component that wraps all pages
 * Provides theme context and global styles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @returns {JSX.Element} Root layout
 */
export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

