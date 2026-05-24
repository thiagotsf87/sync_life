import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/sw-register";
import "./globals.css";
import { Space_Grotesk, IBM_Plex_Mono, DM_Sans } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
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
    { media: "(prefers-color-scheme: dark)",  color: "#0F766E" },
    { media: "(prefers-color-scheme: light)", color: "#0F766E" },
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
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${dmSans.variable}`}
    >
      <body className={`${dmSans.className} antialiased`}>
        {/* Anti-FOUC: apply theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var DARK=['navy-deep','midnight','charcoal'];var t=localStorage.getItem('synclife-theme')||'system';if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'navy-deep':'cream';}var valid=['navy-deep','midnight','charcoal','cream'];if(valid.indexOf(t)===-1)t='navy-deep';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-scheme',DARK.indexOf(t)!==-1?'dark':'light');localStorage.removeItem('synclife-mode');}catch(e){document.documentElement.setAttribute('data-theme','navy-deep');document.documentElement.setAttribute('data-scheme','dark');}})()`,
          }}
        />
        {children}
        <Toaster position="top-right" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
