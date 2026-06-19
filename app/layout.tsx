import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "RAG Engine",
  description: "Motor de preguntas sobre documentos PDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmMono.variable} h-full`}>
      <body className="min-h-full font-mono antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
