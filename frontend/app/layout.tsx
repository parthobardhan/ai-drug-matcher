import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optum RX Drug Matcher - AI-Powered Medication Search",
  description: "Demo application showcasing MongoDB Vector Search, Full-Text Search, and Hybrid Search with VoyageAI embeddings for United Health Group",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
