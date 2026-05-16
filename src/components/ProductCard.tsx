'use client';

import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  isAdded: boolean;
}

export default function ProductCard({ product, onAdd, isAdded }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <Image 
          src={product.image} 
          alt={product.name} 
          width={300} 
          height={300} 
          className="product-image"
        />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.description}</p>
      <div className="product-bottom">
        <span className="product-price">{product.price}</span>
        <button 
          className={`add-btn ${isAdded ? 'added' : ''}`}
          onClick={() => onAdd(product)}
        >
          {isAdded ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
}
