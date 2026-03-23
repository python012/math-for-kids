import type { Metadata } from "next";
import { Fredoka, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "数学小天才 - 乘法游戏",
  description: "帮助小朋友学习10以内乘法的有趣游戏",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${fredoka.variable} ${notoSansSC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
