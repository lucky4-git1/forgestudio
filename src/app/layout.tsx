import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge Studio",
  description: "AI-Powered Creative Generation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
