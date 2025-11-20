import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blue Feathers Gym | Premium Fitness Center & Gym Membership',
  description: 'Join Blue Feathers Gym - Your premier fitness center with state-of-the-art equipment, expert trainers, and flexible membership plans. Transform your fitness journey today!',
  keywords: [
    'Blue Feathers Gym',
    'fitness center',
    'gym membership',
    'personal training',
    'workout facility',
    'fitness classes',
    'gym near me',
    'premium gym'
  ],
  authors: [{ name: 'Blue Feathers Gym' }],
  creator: 'Blue Feathers Gym',
  publisher: 'Blue Feathers Gym',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  metadataBase: new URL('https://blue-feathers.mehara.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blue-feathers.mehara.io',
    title: 'Blue Feathers Gym | Premium Fitness Center',
    description: 'Join Blue Feathers Gym - Your premier fitness center with state-of-the-art equipment, expert trainers, and flexible membership plans.',
    siteName: 'Blue Feathers Gym',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Feathers Gym - Premium Fitness Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Feathers Gym | Premium Fitness Center',
    description: 'Join Blue Feathers Gym - Transform your fitness journey with expert trainers and state-of-the-art equipment.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you set up:
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data for Local Business (helps Google understand your gym)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': 'https://blue-feathers.mehara.io',
    name: 'Blue Feathers Gym',
    description: 'Premium fitness center offering state-of-the-art equipment, expert personal training, and flexible membership plans.',
    url: 'https://blue-feathers.mehara.io',
    telephone: '+94-XX-XXX-XXXX', // Add your phone number
    email: 'support@bluefeathersgym.com',
    image: 'https://blue-feathers.mehara.io/og-image.jpg',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address', // Update with actual address
      addressLocality: 'Your City', // Update with actual city
      addressRegion: 'Your Region', // Update with actual region
      postalCode: 'Your Postal Code', // Update with actual postal code
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 0.0, // Add your actual latitude
      longitude: 0.0, // Add your actual longitude
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '06:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      // Add your social media links when available
      // 'https://www.facebook.com/bluefeathersgym',
      // 'https://www.instagram.com/bluefeathersgym',
      // 'https://www.twitter.com/bluefeathersgym',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
