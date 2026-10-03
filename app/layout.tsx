import "./globals.css";
import UpdateChecker from "../components/UpdateChecker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#020617" />
        <meta name="format-detection" content="telephone=no" />
        <title>CalcPro — Smart Professional Calculator</title>

        {/* Icons */}
        <link rel="manifest" href="manifest.json" />
        <link rel="icon" href="favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
      </head>
      <body>
        <UpdateChecker />
        {children}
      </body>
    </html>
  );
}
