import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata = {
  title: "SnapSheet — Image to Excel",
  description:
    "Photograph documents and convert them to Excel using Claude Vision AI",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F1117",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
