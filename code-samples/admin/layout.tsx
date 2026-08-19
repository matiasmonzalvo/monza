import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Habitat Conecta',
  description: 'La conexión entre emprendimientos y clientes'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`overscroll-none`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
