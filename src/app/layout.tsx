import type { Metadata } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/karla";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoundIt — Campus Lost & Found",
  description:
    "Report a lost item, post something you found, and reunite belongings with their owners across campus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-line-strong/70 bg-paper-soft">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center font-stamp text-[11px] uppercase tracking-[0.15em] text-ink-faint sm:px-6">
        FoundIt · Campus Lost &amp; Found Board · Be kind, return things
      </div>
    </footer>
  );
}
