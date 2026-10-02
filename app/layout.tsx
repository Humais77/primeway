import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Grow Vest",
    template: "%s | Grow Vest",
  },
  description:
    "Grow Vest is a digital investment platform offering investment plans, account management, referrals, and financial tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7fbf7] font-sans antialiased text-[#173b20]">
        {children}
      </body>
    </html>
  );
}