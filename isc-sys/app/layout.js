import './globals.css';
import Sidebar from './components/Sidebar';
import ConvexClientProvider from './ConvexClientProvider';

export const metadata = {
  title: 'ISC - Inventory & Stock Control',
  description: 'Raw material tracking, wastage control, stock management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-zinc-950 text-zinc-100">
        <ConvexClientProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-auto">
            {children}
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
