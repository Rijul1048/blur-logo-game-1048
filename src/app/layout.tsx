import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blur Logo Game",
  description: "A fullscreen blur logo guessing game display",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden">
      <body className="h-full w-full overflow-hidden bg-black text-white">
        {children}
      </body>
    </html>
  );
}
