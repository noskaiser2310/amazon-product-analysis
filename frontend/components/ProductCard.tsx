import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import StarRating from './StarRating';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setIsAdding(false);
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full group relative">
      <Link to={`/product/${product.product_id}`} className="block">
        <div className="relative">
          <img
            src={product.img_link}
            alt={product.product_name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount_percentage > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-500 mb-1">{product.category_leaf}</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex-grow h-10">
          <Link to={`/product/${product.product_id}`} className="hover:text-cyan-600 line-clamp-2">
            {product.product_name}
          </Link>
        </h3>
        <div className="flex items-center my-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500 ml-2">({product.rating_count.toLocaleString()})</span>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 mb-3">
            <p className="text-lg font-bold text-slate-800">₹{product.discounted_price.toLocaleString()}</p>
            <p className="text-sm text-gray-400 line-through">₹{product.actual_price.toLocaleString()}</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/product/${product.product_id}`} 
              className="flex-1 text-center bg-cyan-600 text-white py-2 rounded-md font-semibold hover:bg-cyan-700 transition-colors"
            >
              Details
            </Link>
            {showAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 py-2 rounded-md font-semibold transition-colors flex items-center justify-center space-x-1 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <i className={`fas ${added ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                <span>{added ? 'Added' : 'Cart'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;