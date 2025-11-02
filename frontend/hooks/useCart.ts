import { useState, useCallback, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  img_link: string;
  category_leaf: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const CART_STORAGE_KEY = 'shopping_cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const item = window.localStorage.getItem(CART_STORAGE_KEY);
      return item ? JSON.parse(item) : { items: [], total: 0 };
    } catch (error) {
      console.error('Error loading cart:', error);
      return { items: [], total: 0 };
    }
  });

  const saveCart = useCallback((updatedCart: Cart) => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, []);

  const addToCart = useCallback((product: any, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.product_id === product.product_id);
      
      let updatedItems;
      if (existingItem) {
        updatedItems = prev.items.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.discounted_price,
            quantity,
            img_link: product.img_link,
            category_leaf: product.category_leaf
          }
        ];
      }
      
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const updatedCart = { items: updatedItems, total };
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  const removeFromCart = useCallback((product_id: string) => {
    setCart(prev => {
      const updatedItems = prev.items.filter(item => item.product_id !== product_id);
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const updatedCart = { items: updatedItems, total };
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  const updateQuantity = useCallback((product_id: string, quantity: number) => {
    setCart(prev => {
      let updatedItems;
      if (quantity <= 0) {
        updatedItems = prev.items.filter(item => item.product_id !== product_id);
      } else {
        updatedItems = prev.items.map(item =>
          item.product_id === product_id
            ? { ...item, quantity }
            : item
        );
      }
      
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const updatedCart = { items: updatedItems, total };
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  const clearCart = useCallback(() => {
    const emptyCart = { items: [], total: 0 };
    setCart(emptyCart);
    saveCart(emptyCart);
  }, [saveCart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};