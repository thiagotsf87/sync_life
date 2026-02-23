import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Outfit, Syne, DM_Mono, DM_Sans } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SyncLife - Organize sua vida, transforme sua história",
  description: "Controle financeiro inteligente que sincroniza todas as áreas da sua vida.",
  keywords: ["finanças pessoais", "controle financeiro", "organização", "produtividade"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${syne.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <body className={`${outfit.className} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('synclife-theme');var m=localStorage.getItem('synclife-mode');if(t==='light')document.documentElement.classList.add('light');if(m==='jornada')document.documentElement.classList.add('jornada');}catch(e){}})()`,
          }}
        />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}