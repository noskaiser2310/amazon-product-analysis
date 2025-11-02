import React, { useState, useMemo } from 'react';
import { useProductData } from '../hooks/useProductData';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';
import { Filters as FiltersType } from '../types';

type SortBy = 'default' | 'price-low' | 'price-high' | 'rating' | 'name-az' | 'name-za';

const ProductsPage: React.FC = () => {
  const { products, loading, error, getCategories, searchAndFilterProducts } = useProductData();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    category: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = useMemo(() => getCategories(), [getCategories]);

  const filteredProducts = useMemo(() => {
    return searchAndFilterProducts(searchQuery, filters);
  }, [searchQuery, filters, searchAndFilterProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.discounted_price - b.discounted_price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.discounted_price - a.discounted_price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-az':
        sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'name-za':
        sorted.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      default:
        break;
    }
    
    return sorted;
  }, [filteredProducts, sortBy]);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  const handleFilterChange = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', minPrice: null, maxPrice: null, minRating: null });
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Product Catalog</h1>
          <p className="text-lg opacity-90">Search and filter from thousands of products</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white shadow-md py-6 px-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search for products..."
              className="w-full p-4 pl-12 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-lg"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTERS */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <Filters
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* PRODUCTS SECTION */}
          <section className="lg:col-span-3">
            {/* HEADER + CONTROLS */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {searchQuery || filters.category ? 'Search Results' : 'All Products'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {displayedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </div>
            </div>

            {/* SORT OPTIONS */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="text-sm font-semibold text-gray-700 block mb-3">Sort By:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'default' as SortBy, label: '📊 Default', icon: 'fas fa-list' },
                  { value: 'price-low' as SortBy, label: '💰 Price ↑', icon: 'fas fa-sort-amount-up' },
                  { value: 'price-high' as SortBy, label: '💸 Price ↓', icon: 'fas fa-sort-amount-down' },
                  { value: 'rating' as SortBy, label: '⭐ Rating', icon: 'fas fa-star' },
                  { value: 'name-az' as SortBy, label: 'A → Z', icon: 'fas fa-arrow-right' },
                  { value: 'name-za' as SortBy, label: 'Z → A', icon: 'fas fa-arrow-left' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      sortBy === option.value
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayedProducts.map(product => (
                    <ProductCard key={product.product_id} product={product} showAddToCart={true} />
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 py-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fas fa-chevron-left mr-2"></i>Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1 
                          : Math.max(1, currentPage - 2) + i;
                        
                        if (pageNum <= totalPages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                currentPage === pageNum
                                  ? 'bg-cyan-600 text-white shadow-lg'
                                  : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="text-gray-600 px-2">...</span>
                    )}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Next<i className="fas fa-chevron-right ml-2"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <i className="fas fa-search fa-3x text-slate-400 mb-4"></i>
                <h3 className="text-2xl font-semibold text-slate-700">No products found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;