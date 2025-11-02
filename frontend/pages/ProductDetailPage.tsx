import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductData, useViewedProducts } from '../hooks/useProductData';
import { useCart } from '../hooks/useCart';
import { useApi } from '../hooks/useApi';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, loading } = useProductData();
  const { addViewedProduct, viewed } = useViewedProducts();
  const { addToCart } = useCart();
  const { fetchData } = useApi();
  
  // ✅ Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = useMemo(() => productId ? getProductById(productId) : undefined, [productId, getProductById]);

  useEffect(() => {
    if (productId) {
      addViewedProduct(productId);
    }
  }, [productId, addViewedProduct]);

  // ✅ Fetch recommendations từ REAL MODEL
  useEffect(() => {
    if (!productId) return;
    
    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        const result = await fetchData(`/recommendations-for-product/${productId}?count=5`, {
          method: 'GET'
        });
        
        if (result?.data) {
          setRecommendations(result.data);
          console.log(`✅ Fetched ${result.data.length} recommendations for product ${productId}`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [productId, fetchData]);

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) return <div className="h-96"><Spinner /></div>;
  if (!product) return (
    <div className="text-center mt-16">
      <i className="fas fa-search fa-3x text-slate-400 mb-4"></i>
      <h2 className="text-2xl font-bold text-slate-800">Product not found.</h2>
      <p className="text-slate-600 mt-2">This product doesn't exist or has been removed.</p>
      <Link to="/" className="inline-block mt-4 px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">
        Go Back to Home
      </Link>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Product Detail Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img src={product.img_link} alt={product.product_name} className="w-full h-auto max-h-[500px] object-contain rounded-lg" />
          </div>

          {/* Info */}
          <div>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><Link to="/" className="hover:text-cyan-600">Home</Link></li>
                {product.category_path.map((cat, i) => (
                  <React.Fragment key={i}>
                    <li><span className="mx-2">/</span></li>
                    <li className={i === product.category_path.length - 1 ? 'font-semibold text-gray-700' : ''}>{cat}</li>
                  </React.Fragment>
                ))}
              </ol>
            </nav>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">{product.product_name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500 ml-3">{product.rating_count.toLocaleString()} ratings</span>
            </div>

            <hr className="my-4"/>

            {/* Pricing */}
            <div className="space-y-2 mb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-red-600">₹{product.discounted_price.toLocaleString()}</span>
                <span className="text-red-500 text-lg font-semibold">{product.discount_percentage}% OFF</span>
              </div>
              <p className="text-sm text-gray-500">
                M.R.P.: <span className="line-through">₹{product.actual_price.toLocaleString()}</span>
              </p>
            </div>

            {/* About Product */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this product</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.about_product}</p>
            </div>

            {/* ✅ QUANTITY + ADD TO CART */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-2 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <i className={`fas ${addedToCart ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                <span>{addedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* View on Amazon */}
            <a href={product.product_link} target="_blank" rel="noopener noreferrer" 
              className="block text-center bg-cyan-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-cyan-700 transition-colors">
              View on Amazon
            </a>
          </div>
        </div>
      </div>

      {/* ✅ RECOMMENDATIONS SECTION */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
          <i className="fas fa-lightbulb mr-2 text-amber-500"></i>
          You May Also Like ({recommendations.length})
        </h2>
        
        {recLoading ? (
          <div className="h-96"><Spinner /></div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {recommendations.map(rec => (
              <ProductCard key={rec.product_id} product={rec} showAddToCart={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <i className="fas fa-inbox fa-3x text-slate-400 mb-4"></i>
            <p className="text-gray-600">No recommendations available</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;