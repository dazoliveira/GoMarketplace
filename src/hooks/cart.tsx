import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productList = await AsyncStorage.getItem('@GoMarketplace:products');
      if (productList) {
        setProducts([...JSON.parse(productList)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let productsUpdated: Product[] = [];
      if (products?.some(item => item?.id === product.id)) {
        productsUpdated = products.map(prodUp => ({
          ...prodUp,
          quantity:
            product.id === prodUp.id ? prodUp.quantity + 1 : prodUp.quantity,
        }));
      } else {
        productsUpdated = [...products, { ...product, quantity: 1 }];
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsUpdated),
      );
      setProducts(productsUpdated);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedQuanties = products?.map(product => {
        return {
          ...product,
          quantity: product.id === id ? product.quantity + 1 : product.quantity,
        };
      });
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedQuanties),
      );
      setProducts(updatedQuanties);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedQuanties = products?.map(product => {
        return {
          ...product,
          quantity:
            product.id === id && product.quantity !== 0
              ? product.quantity - 1
              : product.quantity,
        };
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedQuanties),
      );
      setProducts(updatedQuanties);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
