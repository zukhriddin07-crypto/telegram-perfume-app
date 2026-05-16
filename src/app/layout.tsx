import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atir Do\'koni',
  description: 'Telegram Mini App orqali premium atirlar xarid qiling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        {/* Telegram scriptini klassik usulda, eng tepada yuklaymiz */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
