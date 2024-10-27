import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "AlmarSLC_Attendance",
  description: "AlmarSLC_Attendance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen flex-col items-center overflow-x-hidden">
            <div className="flex w-full flex-1 flex-col items-center">
              <nav className="flex h-16 w-full justify-center border-b border-b-foreground">
                <div className="flex w-full max-w-5xl items-center justify-end gap-8 p-3 px-5 text-sm">
                  <ThemeSwitcher />
                </div>
              </nav>

              <div className="flex flex-col">{children}</div>

              <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t border-t-foreground py-16 text-center text-xs">
                <p>
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
