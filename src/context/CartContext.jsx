import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createCheckout, fetchCart, syncCart, verifyCheckout } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_KEY = 'maddox_cart_v2';

const normalizeItem = (item = {}) => {
  const productId = Number(item.productId || item.product_id || 0);
  const quantity = Math.max(0, Number(item.quantity || 0));

  return {
    productId,
    name: item.name || 'Untitled product',
    price: Number(item.price || 0),
    quantity,
    variant: {
      color: item.variant?.color || item.color || '',
      model: item.variant?.model || item.model || '',
      compatibility: item.variant?.compatibility || item.compatibility || '',
    },
  };
};

const toServerItem = (item) => ({
  product_id: item.productId,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  variant: item.variant,
});

const itemSignature = (item) => {
  const variant = item.variant || {};
  return `${item.productId}::${variant.color || ''}::${variant.model || ''}::${variant.compatibility || ''}`;
};

const mergeItems = (a = [], b = []) => {
  const merged = new Map();

  [...a, ...b].forEach((raw) => {
    const item = normalizeItem(raw);
    if (item.productId <= 0 || item.quantity <= 0) return;

    const key = itemSignature(item);
    const existing = merged.get(key);

    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }

    merged.set(key, item);
  });

  return Array.from(merged.values());
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setItems(Array.isArray(stored) ? mergeItems(stored) : []);
    } catch (error) {
      localStorage.removeItem(CART_KEY);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const hydrate = async () => {
      if (!user) return;

      setLoading(true);
      setSyncError('');

      try {
        const remoteCart = await fetchCart();
        const remoteItems = Array.isArray(remoteCart?.items)
          ? remoteCart.items.map((item) => normalizeItem(item))
          : [];

        setItems((prev) => {
          const merged = mergeItems(prev, remoteItems);
          syncCart(merged.map(toServerItem)).catch(() => {
            setSyncError('Cart saved locally. Backend sync will retry on next update.');
          });
          return merged;
        });
      } catch (error) {
        setSyncError('Cart saved locally. Backend sync unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [user]);

  const updateItems = (updater) => {
    setItems((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const normalized = mergeItems(next);

      if (user) {
        syncCart(normalized.map(toServerItem)).catch(() => {
          setSyncError('Cart update saved locally. Backend sync unavailable right now.');
        });
      }

      return normalized;
    });
  };

  const addToCart = (product, variant = {}) => {
    const normalized = normalizeItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      variant,
    });

    updateItems((prev) => mergeItems(prev, [normalized]));
  };

  const updateQuantity = (signature, quantity) => {
    updateItems((prev) =>
      prev
        .map((item) => (itemSignature(item) === signature ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (signature) => {
    updateItems((prev) => prev.filter((item) => itemSignature(item) !== signature));
  };

  const clearCart = () => {
    updateItems([]);
  };

  const checkout = async ({
    phoneNumber,
    paymentMethod = 'mpesa',
    paymentProvider = 'flutterwave',
    customerName,
    customerEmail,
  }) => {
    const payloadItems = items.map(toServerItem);

    const response = await createCheckout({
      items: payloadItems,
      phone_number: phoneNumber,
      payment_method: paymentMethod,
      payment_provider: paymentProvider,
      customer_name: customerName,
      customer_email: customerEmail,
    });

    return response;
  };

  const confirmPayment = async (orderId, txRef) => {
    const response = await verifyCheckout(orderId, {
      tx_ref: txRef,
    });

    if (response?.order?.status === 'paid') {
      clearCart();
    }

    return response;
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = {
    items,
    subtotal,
    totalItems,
    loading,
    syncError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    confirmPayment,
    itemSignature,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
