import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const ADMIN_ID = '541693127';

// Upstash Redis ulanishi (Vercel avtomatik environment variable'larni qo'shadi)
const redis = Redis.fromEnv();

// Ma'lumotlarni bazadan olish
export async function GET() {
  try {
    const products = await redis.get('products');
    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Yangi mahsulot qo'shish
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, userId } = body;

    // Faqat Admin qo'sha oladi
    if (userId?.toString() !== ADMIN_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await redis.get('products');
    const products: any[] = Array.isArray(existing) ? existing : [];
    const newProducts = [...products, { ...product, id: Date.now() }];
    
    await redis.set('products', newProducts);
    
    return NextResponse.json({ success: true, products: newProducts });
  } catch (error) {
    console.error('Redis POST error:', error);
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

    const existing = await redis.get('products');
    const products: any[] = Array.isArray(existing) ? existing : [];
    const newProducts = products.filter(p => p.id.toString() !== id);
    
    await redis.set('products', newProducts);
    
    return NextResponse.json({ success: true, products: newProducts });
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
