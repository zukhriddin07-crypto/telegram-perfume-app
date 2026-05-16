'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const ADMIN_ID = '541693127';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  // Telegram SDK ni ishga tushirish
  const initTelegram = useCallback(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      if (telegram.initDataUnsafe?.user) {
        setUser(telegram.initDataUnsafe.user);
        if (telegram.initDataUnsafe.user.id.toString() === ADMIN_ID) {
          setIsAuthorized(true);
        }
      }
      return true;
    }
    return false;
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initTelegram();
    fetchProducts();
  }, [initTelegram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    const newProduct = {
      ...form,
      price: parseInt(form.price),
      priceLabel: `${parseInt(form.price).toLocaleString()} so'm`
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: newProduct, userId: user.id })
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setForm({ name: '', description: '', price: '', image: '' });
        alert('✅ Tovar muvaffaqiyatli qo\'shildi!');
      }
    } catch (e) {
      alert('❌ Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ushbu tovarni o\'chirmoqchimisiz?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}&userId=${user.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (e) {
      alert('❌ O\'chirishda xatolik');
    }
  };

  if (isLoading) return <div className="loading">Yuklanmoqda...</div>;

  if (!isAuthorized) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1 style={{ color: '#ff3b30' }}>⛔ Kirish taqiqlangan</h1>
        <p>Ushbu sahifa faqat Admin uchun.</p>
        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--secondary-bg)', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Sizning Telegram ID raqamingiz:</p>
          <code style={{ fontSize: '1.2rem', fontWeight: '800', color: var(--gold) }}>{user?.id || "Aniqlanmadi (Sahifani Telegram ichida oching)"}</code>
        </div>
        <p style={{ fontSize: '0.8rem', marginTop: '15px', color: 'var(--hint)' }}>
          * Agar ID "Aniqlanmadi" bo'lsa, linkni Telegram'da o'zingizga yuboring va o'sha yerdan bosing.
        </p>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard" style={{ padding: '20px', paddingBottom: '100px' }}>
      <header className="header-section">
        <h1 className="title">Admin Panel 📊</h1>
        <p className="welcome-msg">Xush kelibsiz, Admin!</p>
      </header>

      <section className="admin-form-section" style={{ marginTop: '30px' }}>
        <h2 className="section-title">✨ Yangi tovar qo'shish</h2>
        <form onSubmit={handleSubmit} className="order-form" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
          <div className="form-group">
            <label className="form-label">Tovar nomi:</label>
            <input 
              className="phone-input" 
              required 
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Masalan: Black Opium"
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Tavsif (Description):</label>
            <textarea 
              className="phone-input" 
              style={{ height: '80px', paddingTop: '10px' }}
              required 
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Mahsulot haqida ma'lumot..."
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Narxi (faqat raqam):</label>
            <input 
              type="number" 
              className="phone-input" 
              required 
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              placeholder="850000"
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Rasm linki (hozircha):</label>
            <input 
              className="phone-input" 
              required 
              value={form.image}
              onChange={e => setForm({...form, image: e.target.value})}
              placeholder="/images/perfume1.png"
            />
          </div>

          <button type="submit" className="phone-input" style={{ marginTop: '20px', background: 'var(--gold)', color: '#fff', border: 'none', fontWeight: '700' }}>
            ➕ TOVARNI QO'SHISH
          </button>
        </form>
      </section>

      <section className="admin-list-section" style={{ marginTop: '40px' }}>
        <h2 className="section-title">🛍 Mavjud tovarlar ({products.length})</h2>
        <div className="admin-products-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {products.map(product => (
            <div key={product.id} className="history-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{product.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gold)' }}>{product.priceLabel}</p>
              </div>
              <button 
                onClick={() => handleDelete(product.id)}
                style={{ background: '#ff3b30', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}
              >
                🗑 O'chirish
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
