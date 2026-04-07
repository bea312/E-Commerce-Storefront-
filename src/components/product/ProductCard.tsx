import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth-store';
import { useCart } from '../../context/cart-store';
import { formatCurrency } from '../../lib/utils';
import type { Product } from '../../types/api';

const fallbackImage =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';

export const ProductCard = ({ product }: { product: Product }) => {
  const { isUser } = useAuth();
  const { addItem, isLoading } = useCart();

  return (
    <article className="product-card panel">
      <div className="product-card__media">
        <img src={product.images[0] || fallbackImage} alt={product.title} />
        <span className="product-card__badge">{product.categoryName || 'Featured'}</span>
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{product.brand}</p>
        <h3>{product.title}</h3>
        <p className="muted product-card__description">{product.description}</p>
        <div className="product-card__meta">
          <strong>{formatCurrency(product.price)}</strong>
          <span>{product.stockQuantity} in stock</span>
        </div>
        <div className="product-card__actions">
          <Link className="button button--ghost" to={`/products/${product.id}`}>
            View details
          </Link>
          <button
            className="button"
            type="button"
            disabled={!isUser || isLoading || product.stockQuantity < 1}
            onClick={() => addItem(product, 1)}
          >
            {isUser ? 'Add to cart' : 'Login to buy'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
