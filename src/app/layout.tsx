import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import NoSSR from "@/components/NoSSR";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WZ Solution - Desenvolvimento de Software",
  description: "Soluções digitais inovadoras para transformar suas ideias em realidade. Desenvolvimento de apps mobile, web apps e sites institucionais.",
  keywords: "desenvolvimento de software, apps mobile, web apps, sites institucionais, soluções digitais",
  authors: [{ name: "WZ Solution" }],
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
    title: "WZ Solution - Desenvolvimento de Software",
    description: "Soluções digitais inovadoras para transformar suas ideias em realidade",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/images/wzlogo_trans.png",
        width: 1200,
        height: 630,
        alt: "WZ Solution Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <NoSSR>
          <Header />
        </NoSSR>
        <main>{children}</main>
        <NoSSR>
          <Footer />
        </NoSSR>
        <NoSSR>
          <WhatsAppButton />
        </NoSSR>
      </body>
    </html>
  );
}