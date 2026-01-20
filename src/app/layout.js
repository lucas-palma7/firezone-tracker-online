import './globals.css'

export const metadata = {
  title: 'Firezone Hub',
  description: 'Tracker de comandas online para o Firezone',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  )
}
