import "./globals.css";

export const metadata = {
  title: "SnapSheet — Image to Excel",
  description:
    "Photograph documents and convert them to Excel using Claude Vision AI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
