import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { AtlasProvider } from "../components/atlas-provider";

export const metadata: Metadata = {
  title: "BuildPod OS",
  description: "Operational readiness and workflow system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem={false}
>
  <AtlasProvider>{children}</AtlasProvider>
</ThemeProvider>
      </body>
    </html>
  );
}