'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_ID = '541693127';
const ADMIN_PIN = '2024'; // Siz bu PIN-kodni xohlagan raqamga o'zgartirishingiz mumkin

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [userId, setUserId] = useState<string>(ADMIN_ID);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  // Rasm yuklash mantiqi
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yuklashda xatolik');
      }

      const newBlob = await response.json();
      setForm(prev => ({ ...prev, image: newBlob.url }));
      alert('✅ Rasm muvaffaqiyatli yuklandi!');
    } catch (error: any) {
      alert(`❌ Xatolik: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Telegram SDK orqali yoki PIN orqali kirish
  useEffect(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram?.initDataUnsafe?.user) {
      const tgUserId = telegram.initDataUnsafe.user.id.toString();
      setUserId(tgUserId);
      if (tgUserId === ADMIN_ID) {
        setIsAuthorized(true);
      }
    }
    // Oldingi sessiyadan PIN saqlangan bo'lsa
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAuthorized(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Noto\'g\'ri PIN-kod!');
      setPinInput('');
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error('Fetch error', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchProducts();
  }, [isAuthorized, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    const priceNum = parseInt(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Narxni to\'g\'ri kiriting!');
      return;
    }

    const newProduct = {
      name: form.name,
      description: form.description,
      price: priceNum,
      priceLabel: `${priceNum.toLocaleString()} so'm`,
      image: form.image || '/images/perfume1.png'
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: newProduct, userId })
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setForm({ name: '', description: '', price: '', image: '' });
        alert('✅ Tovar muvaffaqiyatli qo\'shildi!');
      } else {
        alert('❌ Xatolik yuz berdi');
      }
    } catch (e) {
      alert('❌ Tarmoq xatosi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ushbu tovarni o\'chirmoqchimisiz?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        alert('✅ Tovar o\'chirildi');
      }
    } catch (e) {
      alert('❌ O\'chirishda xatolik');
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⏳</div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  // PIN-kod kiritish oynasi
  if (!isAuthorized) {
    return (
      <div style={styles.pinContainer}>
        <div style={styles.pinCard}>
          <div style={styles.lockIcon}>🔐</div>
          <h1 style={styles.pinTitle}>Admin Panel</h1>
          <p style={styles.pinSubtitle}>PIN-kodni kiriting</p>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError(''); }}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            placeholder="• • • •"
            style={styles.pinInput}
            autoFocus
          />
          {pinError && <p style={styles.pinError}>{pinError}</p>}
          <button onClick={handlePinSubmit} style={styles.pinButton}>
            KIRISH
          </button>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div style={styles.dashboard}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>📊 Admin Panel</h1>
        <p style={styles.headerSubtitle}>Atirlar Olami — Boshqaruv</p>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{products.length}</span>
            <span style={styles.statLabel}>Tovarlar</span>
          </div>
        </div>
      </header>

      {/* YANGI TOVAR QO'SHISH */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>✨ Yangi tovar qo'shish</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tovar nomi</label>
            <input
              style={styles.input}
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: Black Opium"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tavsif</label>
            <textarea
              style={{ ...styles.input, height: '80px', paddingTop: '12px' }}
              required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mahsulot haqida qisqacha..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Narxi (so'mda)</label>
            <input
              type="number"
              style={styles.input}
              required
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="850000"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tovar rasmi</label>
            <div style={styles.imageUploadContainer}>
              {isUploading ? (
                <div style={styles.imagePlaceholder}>
                  <div className="spinner">⌛</div>
                  <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>Yuklanmoqda...</p>
                </div>
              ) : form.image ? (
                <div style={styles.previewWrapper}>
                  <img src={form.image} alt="Preview" style={styles.largePreview} />
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, image: ''})} 
                    style={styles.removeImageBtn}
                  >✕</button>
                </div>
              ) : (
                <label style={styles.imagePlaceholder}>
                  <span style={{ fontSize: '2rem' }}>📸</span>
                  <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>Rasm tanlang</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            ➕ TOVARNI QO'SHISH
          </button>
        </form>
      </section>

      {/* MAVJUD TOVARLAR */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🛍 Mavjud tovarlar ({products.length})</h2>
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '2rem' }}>📦</p>
            <p>Hali tovar qo'shilmagan. Yuqoridagi forma orqali birinchi tovaringizni qo'shing!</p>
          </div>
        ) : (
          <div style={styles.productList}>
            {products.map(product => (
              <div key={product.id} style={styles.productItem}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={styles.productImage}
                  onError={e => { (e.target as HTMLImageElement).src = '/images/perfume1.png'; }}
                />
                <div style={styles.productInfo}>
                  <h4 style={styles.productName}>{product.name}</h4>
                  <p style={styles.productPrice}>{product.priceLabel}</p>
                  <p style={styles.productDesc}>{product.description?.slice(0, 50)}...</p>
                </div>
                <button onClick={() => handleDelete(product.id)} style={styles.deleteBtn}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ============ STYLES ============
const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0a0a0a', color: '#fff'
  },
  spinner: { fontSize: '3rem', animation: 'spin 1s linear infinite' },

  // PIN screen
  pinContainer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)', padding: '20px'
  },
  pinCard: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
    padding: '40px 30px', textAlign: 'center' as const, width: '100%', maxWidth: '360px'
  },
  lockIcon: { fontSize: '3rem', marginBottom: '10px' },
  pinTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 5px' },
  pinSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: '0 0 25px' },
  pinInput: {
    width: '100%', padding: '16px', fontSize: '1.5rem', textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: '14px', color: '#fff', letterSpacing: '12px', outline: 'none'
  },
  pinError: { color: '#ff3b30', fontSize: '0.85rem', marginTop: '10px' },
  pinButton: {
    width: '100%', padding: '14px', marginTop: '20px', background: 'linear-gradient(135deg, #b8971f, #d4af37)',
    border: 'none', borderRadius: '14px', color: '#fff', fontSize: '1rem',
    fontWeight: '700', cursor: 'pointer'
  },

  // Image Upload Styles
  imageUploadContainer: {
    marginTop: '10px'
  },
  imagePlaceholder: {
    width: '120px', height: '120px', borderRadius: '16px',
    background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(255,255,255,0.5)'
  },
  previewWrapper: {
    position: 'relative' as const, width: '120px', height: '120px'
  },
  largePreview: {
    width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' as const,
    border: '2px solid var(--gold)'
  },
  removeImageBtn: {
    position: 'absolute' as const, top: '-10px', right: '-10px',
    width: '24px', height: '24px', borderRadius: '50%', background: '#ff3b30',
    color: '#fff', border: 'none', fontSize: '12px', fontWeight: '800',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },

  // Dashboard
  dashboard: {
    minHeight: '100vh', background: '#0a0a0a', color: '#fff',
    padding: '20px', paddingBottom: '40px'
  },
  header: {
    background: 'linear-gradient(135deg, rgba(184,151,31,0.2), rgba(212,175,55,0.1))',
    borderRadius: '20px', padding: '24px', marginBottom: '24px',
    border: '1px solid rgba(184,151,31,0.3)'
  },
  headerTitle: { margin: '0 0 4px', fontSize: '1.4rem', fontWeight: '800' },
  headerSubtitle: { margin: '0 0 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' },
  statsRow: { display: 'flex', gap: '12px' },
  statCard: {
    background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 20px',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center'
  },
  statNumber: { fontSize: '1.5rem', fontWeight: '800', color: '#d4af37' },
  statLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' },

  // Section
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' },

  // Form
  form: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'rgba(255,255,255,0.7)' },
  input: {
    width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#fff', fontSize: '0.9rem', outline: 'none'
  },
  hint: { display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
  submitBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #34c759, #2da44e)',
    border: 'none', borderRadius: '12px', color: '#fff', fontSize: '1rem',
    fontWeight: '700', cursor: 'pointer', marginTop: '8px'
  },

  // Product list
  emptyState: {
    textAlign: 'center' as const, padding: '40px 20px', color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.03)', borderRadius: '16px'
  },
  productList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  productItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
    background: 'rgba(255,255,255,0.05)', borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  productImage: { width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' as const },
  productInfo: { flex: 1 },
  productName: { margin: '0 0 2px', fontSize: '0.9rem', fontWeight: '600' },
  productPrice: { margin: '0', fontSize: '0.8rem', color: '#d4af37', fontWeight: '700' },
  productDesc: { margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' },
  deleteBtn: {
    width: '36px', height: '36px', background: 'rgba(255,59,48,0.15)',
    border: '1px solid rgba(255,59,48,0.3)', borderRadius: '10px',
    fontSize: '1rem', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  }
};
