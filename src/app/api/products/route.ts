import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const ADMIN_ID = '541693127';

// Ma'lumotlarni bazadan olish
export async function GET() {
  try {
    const products = await kv.get('products');
    return NextResponse.json(products || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Yangi mahsulot qo'shish
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, userId } = body;

    // Faqat Admin qo'sha oladi
    if (userId.toString() !== ADMIN_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products: any[] = (await kv.get('products')) || [];
    const newProducts = [...products, { ...product, id: Date.now() }];
    
    await kv.set('products', newProducts);
    
    return NextResponse.json({ success: true, products: newProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

// Mahsulotni o'chirish
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (userId !== ADMIN_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products: any[] = (await kv.get('products')) || [];
    const newProducts = products.filter(p => p.id.toString() !== id);
    
    await kv.set('products', newProducts);
    
    return NextResponse.json({ success: true, products: newProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
