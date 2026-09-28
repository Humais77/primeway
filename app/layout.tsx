import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prime Way",
    template: "%s | Prime Way",
  },
  description:
    "Prime Way is a digital investment platform offering investment plans, account management, referrals, and financial tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f7ff] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}