import type { Metadata } from 'next';
// Script import is kept for potential CDN libs, but jspdf/html2canvas might not be needed
// import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar'; // New Navbar
import { Footer } from '@/components/layout/Footer'; // New Footer

// AuthProvider and WorkspaceProvider are removed as they are CMS-specific
// import { AuthProvider } from '@/contexts/AuthContext';
// import { WorkspaceProvider } from '@/contexts/WorkspaceContext';


export const metadata: Metadata = {
  title: 'Blisszits - Social Media Content Management Experts', // Updated title
  description: 'Blisszits offers expert social media strategy, content creation, and management services to elevate your brand. Based in Nigeria, serving clients globally.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        {/* AuthProvider and WorkspaceProvider removed */}
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster />
        {/* 
          Scripts for jspdf and html2canvas are commented out as they are not 
          directly needed for a basic corporate site unless a specific feature requires them.
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
        */}
      </body>
    </html>
  );
}
