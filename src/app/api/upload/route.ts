import { NextResponse } from 'next/server';

// ImgBB bepul rasm hosting API
const IMGBB_API_KEY = 'b0ea3f22e0a9ad79e41e75a1bce08a18';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Faylni base64 ga o'tkazish
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // ImgBB ga yuklash
    const imgbbForm = new FormData();
    imgbbForm.append('key', IMGBB_API_KEY);
    imgbbForm.append('image', base64);
    imgbbForm.append('name', file.name.split('.')[0]);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ 
        url: result.data.display_url,
        thumb: result.data.thumb?.url || result.data.display_url
      });
    } else {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
