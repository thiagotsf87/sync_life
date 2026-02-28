import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/sw-register";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SyncLife",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#10b981" },
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${outfit.variable} ${syne.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <body className={`${outfit.className} antialiased`}>
        {/* Anti-FOUC: apply theme/mode before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var DARK=['navy-dark','obsidian','rosewood','graphite','twilight'];var t=localStorage.getItem('synclife-theme')||'system';var m=localStorage.getItem('synclife-mode')||'foco';if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'navy-dark':'clean-light';}var valid=['navy-dark','clean-light','mint-garden','obsidian','rosewood','arctic','graphite','twilight','sahara'];if(valid.indexOf(t)===-1)t='navy-dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-mode',m==='jornada'?'jornada':'foco');document.documentElement.setAttribute('data-scheme',DARK.indexOf(t)!==-1?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','navy-dark');document.documentElement.setAttribute('data-mode','foco');document.documentElement.setAttribute('data-scheme','dark');}})()`,
          }}
        />
        {children}
        <Toaster position="top-right" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
