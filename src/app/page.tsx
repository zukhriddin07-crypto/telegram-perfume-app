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
                    body: JSON.stringify({
                        user: user,
                        items: cart,
                        total: totalPrice
                    })
                });

                if (response.ok) {
                    tg.showPopup({
                        title: 'Muvaffaqiyatli!',
                        message: 'Buyurtmangiz egasiga yuborildi. Tez orada siz bilan bog\'lanishadi.',
                        buttons: [{ type: 'ok' }]
                    }, () => {
                        tg.close();
                    });
                } else {
                    tg.showAlert('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
                }
            } catch (error) {
                tg.showAlert('Tarmoq xatosi. Internetni tekshiring.');
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
      
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      if (cart.length > 0) {
        tg.MainButton.setText(`BUYURTMA BERISH (${totalPrice.toLocaleString()} so'm)`);
        tg.MainButton.setParams({
            color: '#d4af37',
            text_color: '#ffffff'
        });
        tg.MainButton.show();
        tg.MainButton.onClick(onMainButtonClick);
      } else {
        tg.MainButton.hide();
      }
    }

    return () => {
      if (tg) {
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
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  return (
    <main className="container fade-in">
      <header className="header-section">
        <div className="cart-header">
           <h1 className="title" style={{ margin: 0 }}>Atir Do'koni</h1>
           <div className="cart-icon-wrapper">
             🛒 {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
           </div>
        </div>
        
        {user && (
          <div className="welcome-msg">
            Salom, <b>{user.first_name}</b>! 👋 <br/> Premium atirlar olamiga xush kelibsiz.
          </div>
        )}
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

      <style jsx>{`
        .header-section {
          margin-bottom: 1.5rem;
        }
        .welcome-msg {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: var(--app-hint);
          text-align: center;
          line-height: 1.4;
        }
        .fade-in {
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
