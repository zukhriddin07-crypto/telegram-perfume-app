import { NextResponse } from 'next/server';

const BOT_TOKEN = '8797290387:AAEPzoObVISG6ArjG95XeK5i6yGmVRCQo6c';
const ADMIN_CHAT_ID = '541693127';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, items, total } = body;

    const itemsText = items.map((item: any) => `🔹 ${item.name} - ${item.price.toLocaleString()} so'm`).join('\n');
    
    const message = `
🆕 YANGI BUYURTMA! 🛍

👤 Mijoz: ${user?.first_name || 'Noma\'lum'} ${user?.last_name || ''}
🆔 Username: @${user?.username || 'yo\'q'}

🛒 Mahsulotlar:
${itemsText}

💰 Jami: ${total.toLocaleString()} so'm

✅ Iltimos, mijoz bilan bog'laning!
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order API Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
