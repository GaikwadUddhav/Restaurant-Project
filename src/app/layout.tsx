
import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'TableTap | Exquisite Dining & Table Reservations',
  description: 'Book your table and order delicious food at TableTap.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-8 border-t bg-card mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="font-headline text-2xl text-primary mb-2">TableTap</p>
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} TableTap Fine Dining. All rights reserved.</p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
