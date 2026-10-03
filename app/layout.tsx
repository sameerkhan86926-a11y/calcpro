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
        <title>CalcPro — Smart Professional Calculator</title>

        {/* Icons */}
        <link rel="manifest" href="/calcpro/manifest.json" />
        <link rel="icon" href="/calcpro/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/calcpro/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/calcpro/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/calcpro/apple-touch-icon.png" />
      </head>
      <body>
        <UpdateChecker />
        {children}
      </body>
    </html>
  );
}
