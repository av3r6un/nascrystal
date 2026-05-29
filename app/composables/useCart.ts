export interface CartItemQuantity {
  value: number;
  max: number;
}

export interface CartItem {
  id: number;
  name: string;
  properties: string[];
  price: number;
  image: string;
  quantity?: CartItemQuantity;
}

const CART_STORAGE_KEY = 'cart';

export const useCart = () => {
  const cartItems = useState<CartItem[]>('cart:items', () => []);

  const saveCart = () => {
    if (!import.meta.client) return;

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value));
  };

  const loadCart = () => {
    if (!import.meta.client) return;

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      const parsedCart = JSON.parse(storedCart);
      cartItems.value = Array.isArray(parsedCart) ? parsedCart : [];
    }
    catch {
      cartItems.value = [];
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const cartChange = (items = cartItems.value) => {
    cartItems.value = items;
    saveCart();
  };

  const add = (item: CartItem) => {
    const cartItem = cartItems.value.find(i => i.id === item.id);

    if (!cartItem) {
      cartChange([
        ...cartItems.value,
        {
          ...item,
          quantity: {
            value: item.quantity?.value ?? 1,
            max: item.quantity?.max ?? item.quantity?.value ?? 1,
          },
        },
      ]);
      return;
    }

    const currentValue = cartItem.quantity?.value ?? 1;
    const addedValue = item.quantity?.value ?? 1;
    const maxValue = cartItem.quantity?.max ?? item.quantity?.max ?? currentValue + addedValue;

    cartItem.quantity = {
      value: Math.min(currentValue + addedValue, maxValue),
      max: maxValue,
    };
    cartChange();
  };

  const changeQuantity = (id: number, value: number) => {
    const cartItem = cartItems.value.find(item => item.id === id);
    if (!cartItem) return;

    cartItem.quantity = {
      value,
      max: cartItem.quantity?.max ?? value,
    };
    cartChange();
  };

  const remove = (id: number) => {
    cartChange(cartItems.value.filter(item => item.id !== id));
  };

  const clearCart = () => {
    cartItems.value = [];

    if (!import.meta.client) return;
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  if (import.meta.client) {
    onMounted(loadCart);
  }

  return {
    cartItems,
    add,
    cartChange,
    changeQuantity,
    remove,
    removeItem: remove,
    clearCart,
  };
};
