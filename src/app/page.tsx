'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Markazlashtirilgan Orqaga qaytish mantiqi
  const handleBack = useCallback(() => {
    if (selectedProduct) {
      setSelectedProduct(null);
    } else if (isCartOpen) {
      setIsCartOpen(false);
    }
    tg?.HapticFeedback?.impactOccurred('light');
  }, [selectedProduct, isCartOpen, tg]);

  // Savatni tozalash mantiqi
  const handleClearCart = useCallback(() => {
    if (!tg) return;
    tg.showConfirm('Savatni butunlay tozalamoqchimisiz?', (confirmed: boolean) => {
      if (confirmed) {
        setCart([]);
        setIsCartOpen(false);
        tg.HapticFeedback?.notificationOccurred('warning');
      }
    });
  }, [tg]);

  useEffect(() => {
    if (!tg) return;

    // BackButton boshqaruvi
    if (selectedProduct || isCartOpen) {
      tg.BackButton.show();
      tg.BackButton.offClick(handleBack);
      tg.BackButton.onClick(handleBack);
    } else {
      tg.BackButton.hide();
      tg.BackButton.offClick(handleBack);
    }

    // SecondaryButton (Savatni tozalash) boshqaruvi
    if (isCartOpen && cart.length > 0) {
      tg.SecondaryButton.setParams({
        text: 'SAVATNI TOZALASH',
        color: '#ff3b30',
        is_visible: true
      });
      tg.SecondaryButton.offClick(handleClearCart);
      tg.SecondaryButton.onClick(handleClearCart);
    } else {
      tg.SecondaryButton.hide();
      tg.SecondaryButton.offClick(handleClearCart);
    }

    return () => {
      tg.BackButton.offClick(handleBack);
      tg.SecondaryButton.offClick(handleClearCart);
    };
  }, [tg, selectedProduct, isCartOpen, cart.length, handleBack, handleClearCart]);

  // Savatni yopish
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Savatni ochish
  const openCart = useCallback(() => {
    setIsCartOpen(true);
    tg?.HapticFeedback?.impactOccurred('medium');
  }, [tg]);

  // Tafsilotlarni yopish
  const closeDetails = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // Mahsulotni tanlash
  const openDetails = useCallback((product: any) => {
    setSelectedProduct(product);
    tg?.HapticFeedback?.impactOccurred('light');
  }, [tg]);

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

    if (!isCartOpen) {
      openCart();
      return;
    }

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
  }, [tg, totalPrice, user, cart, phoneNumber, isCartOpen, openCart]);

  useEffect(() => {
    if (!tg?.MainButton) return;

    if (cart.length > 0) {
      const isPhoneValid = isCartOpen ? (phoneNumber.length >= 7) : true;
      tg.MainButton.setParams({
        text: isCartOpen 
          ? (isPhoneValid ? `BUYURTMANI TASDIQLASH (${totalPrice.toLocaleString('uz-UZ')} so'm)` : 'Telefon raqamingizni kiriting')
          : "SAVATGA O'TISH",
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
  }, [tg, cart, totalPrice, onMainButtonClick, phoneNumber, isCartOpen]);

  // Savatga qo'shish/olib tashlash
  const toggleCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    tg?.HapticFeedback?.impactOccurred('medium');
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
    tg?.HapticFeedback?.impactOccurred('light');
  };

  return (
    <main className="container">
      {/* Header */}
      <header className="header-section fade-in">
        <div className="cart-header">
          <h1 className="title">Atirlar Olami</h1>
          <div className="cart-icon-wrapper" onClick={openCart} style={{ cursor: 'pointer' }}>
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
              onClick={openDetails}
              isAdded={!!cart.find(item => item.id === product.id)}
            />
          </div>
        ))}
      </div>

      {/* MAHSULOT TAFSILOTLARI MODALI (DETAILS VIEW) */}
      {selectedProduct && (
        <div className="details-view">
          <div className="details-image-container">
            <Image 
              src={selectedProduct.image} 
              alt={selectedProduct.name} 
              width={600} 
              height={600} 
              priority
            />
          </div>
          <div className="details-content">
            <p className="details-category">Premium Atir</p>
            <h2 className="details-title">{selectedProduct.name}</h2>
            <div className="details-price-badge">{selectedProduct.priceLabel}</div>
            
            <p className="details-desc-title">Mahsulot haqida:</p>
            <p className="details-description">
              {selectedProduct.description} Bu ifor o'zining uzoq vaqt saqlanib qolishi va yuqori sifati bilan ajralib turadi. 
              Mijozlarimizning sevimli tanlovi.
            </p>
            
            <div className="details-action-bar">
              <button 
                className={`phone-input ${cart.find(item => item.id === selectedProduct.id) ? 'added' : ''}`}
                style={{ 
                  background: cart.find(item => item.id === selectedProduct.id) ? 'var(--gold)' : 'var(--secondary-bg)',
                  color: cart.find(item => item.id === selectedProduct.id) ? '#ffffff' : 'var(--text)',
                  border: 'none',
                  fontWeight: '600'
                }}
                onClick={() => toggleCart(selectedProduct)}
              >
                {cart.find(item => item.id === selectedProduct.id) ? '✓ Savatga qo\'shilgan' : '🛒 Savatga qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVAT SAHIFASI (CART VIEW) */}
      {isCartOpen && (
        <div className="cart-view">
          <div className="cart-title-section">
            <h2 className="details-title" style={{ marginBottom: 0 }}>Sizning Savatingiz</h2>
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p className="empty-state-text">Savatingiz hozircha bo'sh.</p>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item slide-up">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">{item.priceLabel}</p>
                    </div>
                    <div className="quantity-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span className="qty-num">{item.quantity || 1}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-form" style={{ marginTop: '32px' }}>
                <label className="form-label">Bog'lanish uchun telefon:</label>
                <div className="phone-input-wrapper">
                  <input 
                    type="tel" 
                    className="phone-input" 
                    placeholder="+998 90 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <button className="contact-btn" onClick={handleRequestContact}>👤</button>
                </div>
              </div>

              <div className="cart-summary slide-up">
                <div className="summary-row">
                  <span>Mahsulotlar soni:</span>
                  <span>{cart.reduce((s, i) => s + (i.quantity || 1), 0)} ta</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Jami summa:</span>
                  <span>{totalPrice.toLocaleString('uz-UZ')} so'm</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}


