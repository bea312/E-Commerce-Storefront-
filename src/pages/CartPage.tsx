import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/Feedback';
import { useCart } from '../context/cart-store';
import { formatCurrency } from '../lib/utils';

export const CartPage = () => {
  const { cart, updateItem, removeItem, clearCart, isLoading } = useCart();

  if (!cart.items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add a few products from the storefront to start checkout."
        action={<Link className="button" to="/">Browse products</Link>}
      />
    );
  }

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <div>
          <p className="eyebrow">Shopping cart</p>
          <h1>Review line items before checkout</h1>
        </div>
        <button className="button button--ghost" type="button" disabled={isLoading} onClick={() => clearCart()}>
          Clear cart
        </button>
      </section>

      <section className="cart-grid">
        <div className="cart-list panel">
          {cart.items.map((item: (typeof cart.items)[number]) => (
            <article className="cart-item" key={item.id}>
              <img src={item.image} alt={item.productTitle} />
              <div className="cart-item__content">
                <h3>{item.productTitle}</h3>
                <p className="muted">{formatCurrency(item.price)} each</p>
                <div className="quantity-row">
                  <button type="button" onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateItem(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item__aside">
                <strong>{formatCurrency(item.subtotal)}</strong>
                <button className="button button--ghost" type="button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="panel order-summary">
          <p className="eyebrow">Order summary</p>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cart.totalItems}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>{formatCurrency(cart.totalAmount)}</strong>
          </div>
          <Link className="button" to="/checkout">
            Continue to checkout
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default CartPage;
