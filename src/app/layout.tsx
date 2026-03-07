import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { defaultDescription, defaultTitle, siteName, siteUrl } from "@/lib/seo";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description: defaultDescription,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased flex flex-col min-h-screen bg-background" suppressHydrationWarning>
        <AuthProvider>
          <WorkspaceProvider>
            {children}
            <Toaster />
          </WorkspaceProvider>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, softwareSchema]) }}
        />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="afterInteractive" />
        <Script src="https://www.google.com/recaptcha/enterprise.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
