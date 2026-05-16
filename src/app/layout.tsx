import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atirlar Olami — Premium Atirlar Do\'koni',
  description: 'Telegram Mini App orqali eng sara atirlarni xarid qiling. Tez yetkazib berish va sifat kafolati.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
