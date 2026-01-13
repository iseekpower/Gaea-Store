import './globals.css'

export const metadata = {
  title: 'The Gaea Store | Sustainable Lifestyle',
  description: 'Premium sustainable bamboo and wood products for conscious living. Shop eco-friendly personal care, home essentials, apparel, and artisan decor.',
  keywords: 'sustainable, bamboo, eco-friendly, wood products, personal care, home decor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
