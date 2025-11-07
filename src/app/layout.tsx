import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import NoSSR from "@/components/NoSSR";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SchemaMarkup from "@/components/SchemaMarkup";

const inter = Inter({ subsets: ["latin"] });

// ✅ Viewport exportado separadamente (Next.js 15+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // ✅ Suporte para iPhone X e superiores (notch)
};

export const metadata: Metadata = {
  metadataBase: new URL('https://app.wzsolutions.com.br'),
  title: {
    default: "WZ Solution - Desenvolvimento de Software",
    template: "%s | WZ Solution"
  },
  description: "Soluções digitais inovadoras para transformar suas ideias em realidade. Desenvolvimento de apps mobile, web apps e sites institucionais de alta qualidade.",
  keywords: [
    "desenvolvimento de software",
    "apps mobile",
    "web apps", 
    "sites institucionais",
    "soluções digitais",
    "desenvolvimento web",
    "aplicativos mobile",
    "programação",
    "software house",
    "tecnologia",
    "IA artificial",
    "automação",
    "Brasil",
    "São Paulo"
  ],
  authors: [{ name: "WZ Solution", url: "https://app.wzsolutions.com.br" }],
  creator: "WZ Solution",
  publisher: "WZ Solution",
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
  icons: {
    icon: [
      { url: "/images/wzlogo_trans.png", sizes: "32x32", type: "image/png" },
      { url: "/images/wzlogo_trans.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/images/wzlogo_trans.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://app.wzsolutions.com.br",
    siteName: "WZ Solution",
    title: "WZ Solution - Desenvolvimento de Software",
    description: "Soluções digitais inovadoras para transformar suas ideias em realidade. Desenvolvimento de apps mobile, web apps e sites institucionais.",
    images: [
      {
        url: "/images/wzlogo_trans.png",
        width: 1200,
        height: 630,
        alt: "WZ Solution - Desenvolvimento de Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WZ Solution - Desenvolvimento de Software",
    description: "Soluções digitais inovadoras para transformar suas ideias em realidade",
    images: ["/images/wzlogo_trans.png"],
    creator: "@wzsolution",
  },
  alternates: {
    canonical: "https://app.wzsolutions.com.br",
    languages: {
      'pt-BR': 'https://app.wzsolutions.com.br/pt',
      'en-US': 'https://app.wzsolutions.com.br/en',
    },
  },
  verification: {
    google: "G-T34W2161VL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.SUPABASE_URL
    || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || '';

  const supabaseConfigScript = supabaseUrl && supabaseAnonKey
    ? `window.__NEXT_PUBLIC_SUPABASE_URL=${JSON.stringify(supabaseUrl)};window.__NEXT_PUBLIC_SUPABASE_ANON_KEY=${JSON.stringify(supabaseAnonKey)};`
    : '';

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Analytics - Configuração Manual */}
        <GoogleAnalytics measurementId="G-T34W2161VL" />
        {/* Schema Markup para SEO */}
        <SchemaMarkup />
        {supabaseConfigScript && (
          <script
            id="supabase-runtime-config"
            dangerouslySetInnerHTML={{ __html: supabaseConfigScript }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <NoSSR>
          <div className="site-header-footer">
          <Header />
          </div>
        </NoSSR>
        <main>{children}</main>
        <NoSSR>
          <div className="site-header-footer">
          <Footer />
          </div>
        </NoSSR>
        <NoSSR>
          <div className="site-header-footer">
          <WhatsAppButton />
          </div>
        </NoSSR>
      </body>
    </html>
  );
}