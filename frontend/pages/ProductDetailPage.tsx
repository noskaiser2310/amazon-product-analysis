import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductData, useViewedProducts } from '../hooks/useProductData';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, getContentBasedRecommendations, loading } = useProductData();
  const { addViewedProduct } = useViewedProducts();

  const product = useMemo(() => productId ? getProductById(productId) : undefined, [productId, getProductById]);

  // ✅ FIX: Chỉ gọi addViewedProduct khi productId thay đổi
  useEffect(() => {
    if (productId) {
      addViewedProduct(productId);
    }
  }, [productId, addViewedProduct]); // ✅ addViewedProduct giờ stable nhờ useCallback

  const recommendations = useMemo(() => {
    if (!product) return [];
    return getContentBasedRecommendations(product.product_id, 3);
  }, [product, getContentBasedRecommendations]);

  if (loading) return <div className="h-96"><Spinner /></div>;
  if (!product) return <div className="text-center text-2xl font-bold mt-16">Product not found.</div>;

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={product.img_link} alt={product.product_name} className="w-full h-auto max-h-[500px] object-contain rounded-lg" />
          </div>
          <div>
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
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500 ml-3">{product.rating_count.toLocaleString()} ratings</span>
            </div>
            <hr className="my-4"/>
            <div className="space-y-2 mb-6">
                <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-red-600">₹{product.discounted_price.toLocaleString()}</span>
                    <span className="text-red-500 text-lg font-semibold">{product.discount_percentage}% OFF</span>
                </div>
                <p className="text-sm text-gray-500">
                    M.R.P.: <span className="line-through">₹{product.actual_price.toLocaleString()}</span>
                </p>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this product</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.about_product}</p>
            </div>
            <a href={product.product_link} target="_blank" rel="noopener noreferrer" className="inline-block w-full text-center bg-amber-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-amber-600 transition-colors">
              View on Amazon
            </a>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-slate-700">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <ProductCard key={rec.product_id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;