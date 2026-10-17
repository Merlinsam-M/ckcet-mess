// src/context/CartContext.jsx
// Global state management for the food cart.
// Keeps selected items from MenuPage in one shared place across the app.

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // cart state holds object: { [foodId]: { id, name, price, qty } }
  const [cart, setCart] = useState({});

  // Add or remove quantity for a food item (+1 or -1)
  function changeQty(food, delta) {
    setCart((prev) => {
      const currentQty = prev[food.id]?.qty || 0;
      const newQty = Math.max(0, currentQty + delta);

      const next = { ...prev };
      if (newQty === 0) {
        delete next[food.id];
      } else {
        next[food.id] = {
          id: food.id,
          name: food.name,
          price: Number(food.price),
          qty: newQty,
        };
      }
      return next;
    });
  }

  // Clear all items from cart
  function clearCart() {
    setCart({});
  }

  // List of all items currently in cart
  const cartItems = Object.values(cart);

  // Total quantity of items selected
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Total calculated price amount
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        changeQty,
        clearCart,
        totalQty,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the CartContext
export function useCart() {
  return useContext(CartContext);
}
