
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
// Note: Navbar and Footer are for the corporate site, not the (app) layout.
// AuthProvider and WorkspaceProvider wrap everything.
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';


export const metadata: Metadata = {
  title: 'Blisszits - Social Media Content Management Experts',
  description: 'Blisszits offers expert social media strategy, content creation, and management services to elevate your brand. Based in Nigeria, serving clients globally.',
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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" id="jspdf-script" strategy="lazyOnload" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" id="html2canvas-script" strategy="lazyOnload" async></script>
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <AuthProvider>
          <WorkspaceProvider>
            {/* Navbar and Footer are rendered by specific page layouts if needed, not globally here for app/site separation */}
            {children}
            <Toaster />
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
