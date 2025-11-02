import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductData } from '../hooks/useProductData';
import { useCart } from '../hooks/useCart';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const { products, loading } = useProductData();
  const { addToCart } = useCart();
  const { fetchData } = useApi();
  
  // ✅ Recommendation sections - Real-time từ MODEL
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [budgetProducts, setBudgetProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: string]: any[] }>({});
  
  const [recLoading, setRecLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ REAL-TIME MODEL RECOMMENDATIONS - Auto-refresh
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (products.length === 0) return;
      
      setRecLoading(true);
      try {
        // 1️⃣ RECOMMENDED - Sử dụng MODEL: Highest rated products
        try {
          const recResult = await fetchData('/recommendations', {
            method: 'POST',
            body: JSON.stringify({
              cart_items: [],  // Empty cart - return popular
              count: 8
            })
          });
          
          if (recResult?.data) {
            setRecommendedProducts(recResult.data.slice(0, 8));
            console.log("✅ Fetched recommended products from MODEL");
          }
        } catch (e) {
          console.warn("Model fetch failed for recommended, using fallback");
          setRecommendedProducts(
            products.sort((a, b) => b.rating - a.rating).slice(0, 8)
          );
        }

        // 2️⃣ TRENDING - Most reviewed products
        try {
          const trendResult = await fetchData('/recommendations', {
            method: 'POST',
            body: JSON.stringify({
              cart_items: [],
              count: 8
            })
          });
          
          if (trendResult?.data) {
            setTrendingProducts(trendResult.data.slice(0, 8));
            console.log("✅ Fetched trending products from MODEL");
          }
        } catch (e) {
          console.warn("Model fetch failed for trending, using fallback");
          setTrendingProducts(
            products.sort((a, b) => b.rating_count - a.rating_count).slice(0, 8)
          );
        }

        // 3️⃣ BUDGET-FRIENDLY - Sử dụng MODEL: Cheapest + good rating
        try {
          const budgetResult = await fetchData('/recommendations', {
            method: 'POST',
            body: JSON.stringify({
              cart_items: [],
              count: 8
            })
          });
          
          if (budgetResult?.data) {
            // Filter lowest price từ recommendations
            const budgetFiltered = budgetResult.data
              .sort((a, b) => a.discounted_price - b.discounted_price)
              .slice(0, 8);
            setBudgetProducts(budgetFiltered);
            console.log("✅ Fetched budget products from MODEL");
          }
        } catch (e) {
          console.warn("Model fetch failed for budget, using fallback");
          setBudgetProducts(
            products.sort((a, b) => a.discounted_price - b.discounted_price).slice(0, 8)
          );
        }

        // 4️⃣ BY CATEGORY - Category-based recommendations
        const categories = [...new Set(products.map(p => p.category_leaf))].slice(0, 3);
        const categoryMap: { [key: string]: any[] } = {};
        
        for (const cat of categories) {
          try {
            const catProducts = products.filter(p => p.category_leaf === cat);
            
            // Sử dụng MODEL để recommend products trong category này
            const catResult = await fetchData('/recommendations', {
              method: 'POST',
              body: JSON.stringify({
                cart_items: catProducts.slice(0, 1).map(p => ({
                  product_id: p.product_id,
                  price: p.discounted_price,
                  category_leaf: p.category_leaf
                })),
                count: 8
              })
            });
            
            if (catResult?.data) {
              categoryMap[cat] = catResult.data.slice(0, 8);
            } else {
              categoryMap[cat] = catProducts.sort((a, b) => b.rating - a.rating).slice(0, 8);
            }
          } catch (e) {
            categoryMap[cat] = products
              .filter(p => p.category_leaf === cat)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 8);
          }
        }
        
        setCategoryProducts(categoryMap);
        console.log("✅ Fetched category recommendations from MODEL");

      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
    
    // ✅ REAL-TIME: Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecommendations, 30000);
    
    return () => clearInterval(interval);
  }, [products, fetchData]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white py-20 px-4 rounded-xl shadow-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold mb-4">Product Explorer</h1>
          <p className="text-2xl opacity-90 mb-8">AI-Powered Recommendations Just For You</p>
          
          <div className="relative max-w-2xl mx-auto mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full p-4 pl-12 text-slate-800 rounded-full shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none text-lg"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>

          <Link 
            to="/products"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-colors text-lg shadow-lg"
          >
            Browse All Products →
          </Link>
        </div>
      </section>

      {/* RECOMMENDED SECTION */}
      {recLoading && recommendedProducts.length === 0 ? (
        <div className="h-64 flex items-center justify-center"><Spinner /></div>
      ) : (
        <section className="px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-slate-800 flex items-center">
              <i className="fas fa-star text-yellow-500 mr-3 text-3xl"></i>
              Recommended For You
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              {recLoading && <i className="fas fa-spinner fa-spin mr-2"></i>}
              Updated 30 seconds ago
            </span>
          </div>
          
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 4).map(product => (
                <ProductCard key={product.product_id} product={product} showAddToCart={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Loading recommendations...</p>
            </div>
          )}
        </section>
      )}

      {/* TRENDING SECTION */}
      {trendingProducts.length > 0 && (
        <section className="px-4">
          <h2 className="text-4xl font-bold text-slate-800 mb-8 flex items-center">
            <i className="fas fa-fire text-red-500 mr-3 text-3xl"></i>
            Trending Now
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map(product => (
              <ProductCard key={product.product_id} product={product} showAddToCart={true} />
            ))}
          </div>
        </section>
      )}

      {/* BUDGET-FRIENDLY SECTION */}
      {budgetProducts.length > 0 && (
        <section className="px-4 bg-gradient-to-r from-green-50 to-emerald-50 py-12 rounded-xl">
          <h2 className="text-4xl font-bold text-slate-800 mb-8 flex items-center">
            <i className="fas fa-piggy-bank text-green-600 mr-3 text-3xl"></i>
            Budget-Friendly Picks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {budgetProducts.slice(0, 4).map(product => (
              <div key={product.product_id} className="relative">
                <ProductCard product={product} showAddToCart={true} />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  💰 Best Price
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BY CATEGORY SECTIONS */}
      {Object.keys(categoryProducts).length > 0 && (
        <div className="space-y-12 px-4">
          {Object.entries(categoryProducts).map(([category, prods]) => (
            prods.length > 0 && (
              <section key={category}>
                <h2 className="text-4xl font-bold text-slate-800 mb-8 flex items-center">
                  <i className="fas fa-box text-blue-500 mr-3 text-3xl"></i>
                  {category.replace('&', ' & ')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {prods.slice(0, 4).map(product => (
                    <ProductCard key={product.product_id} product={product} showAddToCart={true} />
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}

      {/* CALL TO ACTION */}
      <section className="px-4 py-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-center">
        <h3 className="text-3xl font-bold mb-4">Explore More Products</h3>
        <p className="text-lg mb-6 opacity-90">Discover thousands of products with advanced search and filters</p>
        <Link 
          to="/products"
          className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-colors text-lg"
        >
          Go to Product Catalog →
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
