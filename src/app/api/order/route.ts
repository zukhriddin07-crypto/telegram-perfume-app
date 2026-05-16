import { NextResponse } from 'next/server';

const BOT_TOKEN = '8797290387:AAEPzoObVISG6ArjG95XeK5i6yGmVRCQo6c';
const ADMIN_CHAT_ID = '541693127';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, items, total, phoneNumber } = body;

    const itemsText = items.map((item: any) => `🔹 <b>${item.name}</b> - ${item.price.toLocaleString()} so'm`).join('\n');
    
    const message = `
<b>🆕 YANGI BUYURTMA!</b> 🛍

👤 <b>Mijoz:</b> ${user?.first_name || 'Noma\'lum'} ${user?.last_name || ''}
🆔 <b>Username:</b> @${user?.username || 'yo\'q'}
📞 <b>Telefon:</b> <code>${phoneNumber || 'Kiritilmagan'}</code>

🛒 <b>Mahsulotlar:</b>
${itemsText}

💰 <b>Jami:</b> <b>${total.toLocaleString()} so'm</b>

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
