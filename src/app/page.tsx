'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';

const PRODUCTS = [
  {
    id: 1,
    name: 'Midnight Elegance',
    description: 'Chuqur va sirli oqshom ifori. Oud, amber va vanil notkalari.',
    price: 850000,
    priceLabel: '850 000 so\'m',
    image: '/images/perfume1.png'
  },
  {
    id: 2,
    name: 'Golden Aura',
    description: 'Issiq va quyoshli, hashamatli hid. Bergamot va sandal daraxti.',
    price: 1200000,
    priceLabel: '1 200 000 so\'m',
    image: '/images/perfume2.png'
  },
  {
    id: 3,
    name: 'Pink Blossom',
    description: 'Yengil va gulli, bahoriy ifor. Jasmin, atirgul va musk.',
    price: 720000,
    priceLabel: '720 000 so\'m',
    image: '/images/perfume3.png'
  }
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [tg, setTg] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Telefon raqamini so'rash (Native Telegram Popup)
  const handleRequestContact = useCallback(() => {
    if (!tg) return;
    tg.requestContact((sent: boolean) => {
      if (sent) {
        tg.HapticFeedback?.notificationOccurred('success');
      }
    });
  }, [tg]);

  // Telegram SDK ni ishga tushirish
  const initTelegram = useCallback(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      telegram.disableVerticalSwipes();

      telegram.setHeaderColor('#b8971f');
      telegram.setBackgroundColor('#ffffff');

      if (telegram.initDataUnsafe?.user) {
        setUser(telegram.initDataUnsafe.user);
      }

      setTg(telegram);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!initTelegram()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (initTelegram() || attempts >= 10) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [initTelegram]);

  // MainButton boshqaruvi
  const onMainButtonClick = useCallback(async () => {
    if (!tg) return;

    if (!phoneNumber || phoneNumber.length < 7) {
      tg.showAlert('Iltimos, bog\'lanish uchun telefon raqamingizni kiriting.');
      return;
    }

    tg.showConfirm(
      `Jami ${totalPrice.toLocaleString('uz-UZ')} so'mlik buyurtmani tasdiqlaysizmi?`,
      async (confirmed: boolean) => {
        if (!confirmed) return;

        tg.MainButton.showProgress();
        try {
          const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, items: cart, total: totalPrice, phoneNumber })
          });

          if (res.ok) {
            tg.HapticFeedback?.notificationOccurred('success');
            tg.showPopup(
              {
                title: '✅ Muvaffaqiyatli!',
                message: 'Buyurtmangiz qabul qilindi. Tez orada siz bilan bog\'lanishadi.',
                buttons: [{ type: 'ok', text: 'Yaxshi' }]
              },
              () => tg.close()
            );
          } else {
            tg.HapticFeedback?.notificationOccurred('error');
            tg.showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
          }
        } catch {
          tg.HapticFeedback?.notificationOccurred('error');
          tg.showAlert('Tarmoq xatosi. Internetni tekshiring.');
        } finally {
          tg.MainButton.hideProgress();
        }
      }
    );
  }, [tg, totalPrice, user, cart, phoneNumber]);

  useEffect(() => {
    if (!tg?.MainButton) return;

    if (cart.length > 0) {
      const isPhoneValid = phoneNumber.length >= 7;
      tg.MainButton.setParams({
        text: isPhoneValid 
          ? `Buyurtma berish — ${totalPrice.toLocaleString('uz-UZ')} so'm`
          : 'Telefon raqamingizni kiriting',
        color: isPhoneValid ? '#d4af37' : '#999999',
        text_color: '#ffffff',
        is_visible: true,
        is_active: isPhoneValid
      });
      tg.MainButton.onClick(onMainButtonClick);
    } else {
      tg.MainButton.hide();
    }

    return () => {
      tg.MainButton.offClick(onMainButtonClick);
    };
  }, [tg, cart, totalPrice, onMainButtonClick, phoneNumber]);

  // Savatga qo'shish/olib tashlash
  const toggleCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      return exists
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product];
    });

    tg?.HapticFeedback?.impactOccurred('medium');
  };

  return (
    <main className="container">
      {/* Header */}
      <header className="header-section fade-in">
        <div className="cart-header">
          <h1 className="title">Atirlar Olami</h1>
          <div className="cart-icon-wrapper">
            🛒
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
        {user && (
          <p className="welcome-msg">
            Salom, <b>{user.first_name}</b>! 👋<br />
            Premium atirlar olamiga xush kelibsiz
          </p>
        )}
      </header>

      {/* Section Title */}
      <p className="section-title fade-in" style={{ animationDelay: '0.1s' }}>
        🔥 Mashhur atirlar
      </p>

      {/* Product Grid */}
      <div className="product-grid">
        {PRODUCTS.map((product, index) => (
          <div
            key={product.id}
            className="slide-up"
            style={{ animationDelay: `${0.15 + index * 0.1}s` }}
          >
            <ProductCard
              product={{ ...product, price: product.priceLabel }}
              onAdd={toggleCart}
              isAdded={!!cart.find(item => item.id === product.id)}
            />
          </div>
        ))}
      </div>

      {/* Savat formasi (faqat savatda narsa bo'lsa chiqadi) */}
      {cart.length > 0 && (
        <div className="order-form slide-up">
          <label className="form-label">Bog'lanish uchun telefon raqami:</label>
          <div className="phone-input-wrapper">
            <input 
              type="tel" 
              className="phone-input" 
              placeholder="+998 90 123 45 67"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button 
              className="contact-btn" 
              onClick={handleRequestContact}
              title="Telegram raqamni ulashish"
            >
              👤
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--hint)', marginTop: '8px' }}>
            * Raqamni qo'lda kiriting yoki yonidagi tugmani bosib Telegram raqamingizni yuboring.
          </p>
        </div>
      )}
    </main>
  );
}

