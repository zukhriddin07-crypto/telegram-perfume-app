import { NextResponse } from 'next/server';

// ImgBB bepul rasm hosting API
const IMGBB_API_KEY = 'b0ea3f22e0a9ad79e41e75a1bce08a18';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 });
    }

    // Faylni base64 ga o'tkazish
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // ImgBB ga yuklash (URLSearchParams orqali)
    const params = new URLSearchParams();
    params.append('key', IMGBB_API_KEY);
    params.append('image', base64);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: params
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ 
        url: result.data.display_url,
        thumb: result.data.thumb?.url || result.data.display_url
      });
    } else {
      console.error('ImgBB error:', JSON.stringify(result));
      return NextResponse.json({ error: result.error?.message || 'Rasm yuklanmadi' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: error.message || 'Yuklashda xatolik' }, { status: 500 });
  }
}
