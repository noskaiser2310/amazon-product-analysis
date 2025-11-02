import { useState, useEffect, useCallback } from 'react';
import { Product, Filters } from '../types';
import { useApi } from './useApi';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Filters } from '../types';
import { useApi } from './useApi';

export const useProductData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchData } = useApi();
  
  // ✅ FIX: Dùng useRef để track fetch status
  const isFetched = useRef(false);

  useEffect(() => {
    // ✅ FIX: Chỉ fetch một lần khi mount
    if (isFetched.current) return;
    
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchData<Product[]>('/products?limit=1200');
        
        if (result?.data) {
          setProducts(result.data);
          setError(null);
          isFetched.current = true;
        } else {
          throw new Error(result?.error || 'Failed to fetch products');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // ✅ Empty dependency array

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.product_id === id);
  }, [products]);

  const getPopularProducts = useCallback((count: number): Product[] => {
    return [...products]
      .sort((a, b) => b.rating_count - a.rating_count)
      .slice(0, count);
  }, [products]);

  const getCategories = useCallback((): string[] => {
    const topCategories = products.map(p => p.category_top).filter(c => c);
    return [...new Set(topCategories)].sort();
  }, [products]);

  const searchAndFilterProducts = useCallback((query: string, filters: Filters): Product[] => {
    let filteredProducts = [...products];

    if (query) {
      const lowercasedQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.product_name.toLowerCase().includes(lowercasedQuery) ||
        p.category_path.some(cat => cat.toLowerCase().includes(lowercasedQuery))
      );
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category_path.includes(filters.category));
    }
    if (filters.minPrice !== null) {
      filteredProducts = filteredProducts.filter(p => p.discounted_price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filteredProducts = filteredProducts.filter(p => p.discounted_price <= filters.maxPrice!);
    }
    if (filters.minRating !== null) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.minRating!);
    }

    return filteredProducts;
  }, [products]);

  const getContentBasedRecommendations = useCallback((productId: string, count: number): Product[] => {
    const sourceProduct = getProductById(productId);
    if (!sourceProduct) return getPopularProducts(count);

    const recommended = products.filter(p =>
      p.product_id !== productId &&
      p.category_leaf === sourceProduct.category_leaf
    );

    return recommended
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count);
  }, [products, getProductById, getPopularProducts]);

  return {
    products,
    loading,
    error,
    getProductById,
    getPopularProducts,
    getCategories,
    searchAndFilterProducts,
    getContentBasedRecommendations
  };
};

export const useViewedProducts = () => {
  const [viewed, setViewed] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem('viewedProducts');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  // ✅ FIX: useCallback để function stable
  const addViewedProduct = useCallback((productId: string) => {
    setViewed(prev => {
      const newViewed = [productId, ...prev.filter(id => id !== productId)].slice(0, 20);
      try {
        window.localStorage.setItem('viewedProducts', JSON.stringify(newViewed));
      } catch (error) {
        console.error(error);
      }
      return newViewed;
    });
  }, []);

  return { viewed, addViewedProduct };
};