import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://applywise.co.za';

export const metadata: Metadata = {
  title: {
    default:  'ApplyWise — Apply to every South African university in one tap',
    template: '%s | ApplyWise',
  },
  description:
    'Fill in one form and apply to all the South African universities you qualify for at once. Built for Grade 12 learners.',
  manifest: '/manifest.json',
  metadataBase: new URL(APP_URL),
  keywords: [
    'university applications', 'South Africa', 'Grade 12', 'matric',
    'NSFAS', 'APS score', 'apply to university',
  ],
  authors:  [{ name: 'ApplyWise' }],
  creator:  'ApplyWise',
  openGraph: {
    type:        'website',
    locale:      'en_ZA',
    url:          APP_URL,
    siteName:    'ApplyWise',
    title:       'ApplyWise — Apply to every South African university in one tap',
    description: 'Fill in one form and apply to all the South African universities you qualify for at once. Built for Grade 12 learners.',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'ApplyWise — One form, every university',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'ApplyWise — Apply to every South African university in one tap',
    description: 'Fill in one form and apply to all the South African universities you qualify for at once.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
  },
  appleWebApp: {
    capable:    true,
    title:      'ApplyWise',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor:    '#0b4f6c',
  width:         'device-width',
  initialScale:   1,
  minimumScale:   1,
  viewportFit:   'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "8px",
              fontFamily: "var(--font-geist-sans)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#1ec97e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#e63946", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
