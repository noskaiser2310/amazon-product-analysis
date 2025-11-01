
import React, { useState, useMemo } from 'react';
import { useProductData } from '../hooks/useProductData';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';
import { Filters as FiltersType } from '../types';

const HomePage: React.FC = () => {
  const { products, loading, error, getCategories, searchAndFilterProducts } = useProductData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    category: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });

  const categories = useMemo(() => getCategories(), [getCategories]);

  const displayedProducts = useMemo(() => {
    return searchAndFilterProducts(searchQuery, filters);
  }, [searchQuery, filters, searchAndFilterProducts]);

  const handleFilterChange = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({ category: '', minPrice: null, maxPrice: null, minRating: null });
    setSearchQuery('');
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-12 px-4 rounded-lg shadow-lg mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Discover Amazing Products</h1>
        <p className="text-lg md:text-xl opacity-90 mb-6">AI-powered recommendations just for you</p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full p-4 pl-12 text-slate-800 rounded-full shadow-inner focus:ring-4 focus:ring-cyan-300 focus:outline-none"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Filters 
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        <section className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-4 text-slate-700">{searchQuery || filters.category ? 'Search Results' : 'Featured Products'}</h2>
            {loading && <div className="h-96"><Spinner /></div>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && displayedProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedProducts.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            )}
            {!loading && displayedProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <i className="fas fa-search fa-3x text-slate-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-700">No products found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or search query.</p>
                </div>
            )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
