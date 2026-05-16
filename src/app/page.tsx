'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';

const PRODUCTS = [
  {
    id: 1,
    name: 'Midnight Elegance',
    description: 'Chuqur va sirli oqshom ifori',
    price: 850000,
    priceLabel: '850,000 so\'m',
    image: '/images/perfume1.png'
  },
  {
    id: 2,
    name: 'Golden Aura',
    description: 'Issiq va quyoshli, hashamatli hid',
    price: 1200000,
    priceLabel: '1,200,000 so\'m',
    image: '/images/perfume2.png'
  },
  {
    id: 3,
    name: 'Pink Blossom',
    description: 'Yengil va gulli, bahoriy ifor',
    price: 720000,
    priceLabel: '720,000 so\'m',
    image: '/images/perfume3.png'
  }
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isTelegramReady, setIsTelegramReady] = useState<string>('Tekshirilmoqda...');

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const onMainButtonClick = useCallback(async () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showConfirm(`Jami ${totalPrice.toLocaleString()} so'mlik buyurtmani tasdiqlaysizmi?`, async (confirmed) => {
        if (confirmed) {
            tg.MainButton.showProgress();
            try {
                const response = await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user, items: cart, total: totalPrice })
                });
                if (response.ok) {
                    tg.showPopup({ title: 'Muvaffaqiyatli!', message: 'Buyurtma yuborildi!', buttons: [{ type: 'ok' }] }, () => tg.close());
                } else {
                    tg.showAlert('Xatolik yuz berdi.');
                }
            } catch (error) {
                tg.showAlert('Tarmoq xatosi.');
            } finally {
                tg.MainButton.hideProgress();
            }
        }
      });
    }
  }, [totalPrice, user, cart]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setIsTelegramReady('OK ✅');
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    } else {
      setIsTelegramReady('Xato ❌ (Telegram topilmadi)');
    }
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.MainButton) {
      if (cart.length > 0) {
        tg.MainButton.setParams({
          text: `BUYURTMA BERISH (${totalPrice.toLocaleString()} so'm)`,
          color: '#d4af37',
          text_color: '#ffffff',
          is_visible: true,
          is_active: true
        });
        tg.MainButton.onClick(onMainButtonClick);
      } else {
        tg.MainButton.hide();
      }
    }
    return () => {
      if (tg && tg.MainButton) {
        tg.MainButton.offClick(onMainButtonClick);
      }
    };
  }, [cart, totalPrice, onMainButtonClick]);

  const toggleCart = (product: any) => {
    setCart(prev => {
      const isAlreadyInCart = prev.find(item => item.id === product.id);
      if (isAlreadyInCart) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  return (
    <main className="container">
      <div style={{ fontSize: '10px', textAlign: 'center', opacity: 0.5 }}>
        Telegram Status: {isTelegramReady}
      </div>
      <header className="header-section">
        <div className="cart-header">
           <h1 className="title" style={{ margin: 0 }}>Atir Do'koni</h1>
           <div className="cart-icon-wrapper">
             🛒 {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
           </div>
        </div>
      </header>

      <div style={{ marginTop: '0.5rem' }} className="product-grid">
        {PRODUCTS.map((product, index) => (
          <div key={product.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <ProductCard 
                product={{ ...product, price: product.priceLabel }} 
                onAdd={toggleCart}
                isAdded={!!cart.find(item => item.id === product.id)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
