import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = '8797290387:AAEPzoObVISG6ArjG95XeK5i6yGmVRCQo6c';
const ADMIN_CHAT_ID = '541693127';

// Telegram initData ma'lumotlarini tekshirish funksiyasi
function validateInitData(initData: string) {
  if (!initData) return false;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, items, total, phoneNumber, initData } = body;

    // 🛡️ Xavfsizlik tekshiruvi
    if (!validateInitData(initData)) {
      console.warn('Unauthorized request attempt detected!');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemsText = items.map((item: any) => `🔹 <b>${item.name}</b> (${item.quantity}x) - ${(item.price * item.quantity).toLocaleString()} so'm`).join('\n');
    
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
