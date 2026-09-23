import type { Metadata } from "next";
import { Inter, Noto_Serif_SC } from "next/font/google";
// Next.js processes this global stylesheet; TypeScript has no declaration for CSS imports.
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanzi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baihe - 百合 Series",
  description: "Fan translation site for 百合 (GL) Chinese dramas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerifSC.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased vc-init">
        {children}
      </body>
    </html>
  );
}
