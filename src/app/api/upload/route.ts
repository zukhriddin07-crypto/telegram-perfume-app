import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 });
    }

    // Fayl hajmini tekshirish (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Rasm hajmi 2MB dan oshmasin' }, { status: 400 });
    }

    // Faylni base64 Data URL ga o'tkazish
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: error.message || 'Yuklashda xatolik' }, { status: 500 });
  }
}
