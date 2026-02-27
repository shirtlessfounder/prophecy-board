import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prophecy Board",
  description: "Biblical prophecy mapped to modern AI/tech. Community-built conspiracy board with rigorous textual citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
