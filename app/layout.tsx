import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "IMRWG",
  description: "Frontend clone website",
  icons: {
    icon: "/images/a1.jpeg",
    shortcut: "/images/a1.jpeg",
    apple: "/images/a1.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
