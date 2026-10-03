import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {/* viewport-fit=cover har screen ke gesture bar aur notch ko handle karta hai */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#020617" />
        <meta name="format-detection" content="telephone=no" />
        <title>CalcPro — Smart Professional Calculator</title>
        <meta
          name="description"
          content="Scientific calculator, financial tools, and hidden vault."
        />

        {/* basePath /calcpro ke sath match kiye hue icons */}
        <link rel="manifest" href="/calcpro/manifest.json" />
        <link rel="icon" href="/calcpro/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/calcpro/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/calcpro/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/calcpro/apple-touch-icon.png" />

        {/* Full-screen app & navigation bar style */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="CalcPro" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
