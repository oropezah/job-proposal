import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henry Oropeza",
  robots: { index: false, follow: false, noarchive: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // La clase "js" permite ocultar los elementos que aparecen al hacer scroll solo cuando hay JavaScript.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
