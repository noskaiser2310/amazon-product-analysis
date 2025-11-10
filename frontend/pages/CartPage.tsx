import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

type SortBy = 'recommended' | 'price-low' | 'price-high' | 'rating';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { fetchData } = useApi();
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipcode: ''
  });
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        const result = await fetchData('/recommendations', {
          method: 'POST',
          body: JSON.stringify({
            cart_items: cart.items.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              price: item.price,
              quantity: item.quantity,
              category_leaf: item.category_leaf
            })),
            count: 20
          })
        });
        
        if (result?.data) {
          setRecommendations(result.data);
          setSortBy('recommended');
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [cart.items, fetchData]);

  const sortedRecommendations = useMemo(() => {
    let sorted = [...recommendations];
    
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
      default:
        break;
    }
    
    return sorted;
  }, [recommendations, sortBy]);

  const handleCheckout = async () => {
    if (checkoutStep === 'cart') {
      setCheckoutStep('shipping');
    } else if (checkoutStep === 'shipping') {
      if (!shippingData.name || !shippingData.email || !shippingData.phone || !shippingData.address) {
        alert('Please fill all shipping details');
        return;
      }
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        alert('Please fill all payment details');
        return;
      }
      setCheckoutStep('success');
      clearCart();
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="text-center py-16">
        <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 text-lg mb-6">Thank you for your purchase.</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-6">
          <p className="text-sm text-gray-600 mb-1">Order Total:</p>
          <p className="text-3xl font-bold text-green-600">₹{(cart.total * 1.1).toLocaleString()}</p>
        </div>
        <Link to="/" className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        {(['cart', 'shipping', 'payment'] as const).map((step, index) => (
          <React.Fragment key={step}>
            <div className={`flex items-center space-x-2 ${checkoutStep === step ? 'text-cyan-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                checkoutStep === step ? 'bg-cyan-600 text-white' : 'bg-gray-200'
              }`}>
                {index + 1}
              </div>
              <span className="font-semibold capitalize hidden sm:inline">{step}</span>
            </div>
            {index < 2 && <div className="flex-1 h-1 bg-gray-200 mx-2 sm:mx-4"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Cart/Shipping/Payment */}
        <div className="lg:col-span-2">
          {checkoutStep === 'cart' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.items.length} items)</h2>
              
              {cart.items.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart fa-3x text-gray-400 mb-4"></i>
                  <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
                  <Link to="/" className="inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map(item => (
                    <div key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                        <img src={item.img_link} alt={item.product_name} className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity" />
                      </Link>
                      
                      <div className="flex-grow min-w-0">
                        <Link to={`/product/${item.product_id}`} className="hover:text-cyan-600">
                          <h3 className="font-semibold text-slate-800 line-clamp-2">{item.product_name}</h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">₹{item.price.toLocaleString()} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <i className="fas fa-minus text-xs"></i>
                          </button>
                          <span className="px-3 py-2 font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[5rem]">
                          <p className="font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 text-sm hover:text-red-700 transition-colors mt-1"
                          >
                            <i className="fas fa-trash-alt mr-1"></i>Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {checkoutStep === 'shipping' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={shippingData.name}
                  onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
                <textarea
                  placeholder="Address *"
                  value={shippingData.address}
                  onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[80px]"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingData.city}
                    onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Zipcode"
                    value={shippingData.zipcode}
                    onChange={(e) => setShippingData({...shippingData, zipcode: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>DEMO MODE</strong>: Use any card details for testing
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Card Number (1234 5678 9012 3456)"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Order Summary + Recommendations */}
        <div className="lg:col-span-1">
          {/* ✅ FIXED: Remove sticky, add better spacing */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-receipt mr-2 text-cyan-600"></i>
                Order Summary
              </h3>
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({cart.items.length})</span>
                  <span className="font-semibold">₹{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">₹{Math.round(cart.total * 0.1).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-cyan-600">₹{(cart.total * 1.1).toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.items.length === 0}
                className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
              >
                {checkoutStep === 'cart' ? (
                  <>
                    <i className="fas fa-arrow-right mr-2"></i>
                    Proceed to Shipping
                  </>
                ) : checkoutStep === 'shipping' ? (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Proceed to Payment
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Complete Order
                  </>
                )}
              </button>
            </div>

            {/* ✅ RECOMMENDATIONS - Now fully visible */}
            {checkoutStep === 'cart' && cart.items.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-md p-6 border border-cyan-200">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <i className="fas fa-sparkles text-cyan-600 mr-2"></i>
                  You Might Also Like
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({recommendations.length})
                  </span>
                </h3>
                
                {/* Sort Controls */}
                <div className="mb-4">
                  <label className="text-xs text-gray-600 mb-2 block">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                  >
                    <option value="recommended">🎯 AI Recommended</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💸 Price: High to Low</option>
                    <option value="rating">⭐ Top Rated</option>
                  </select>
                </div>

                {recLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Spinner />
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {sortedRecommendations.slice(0, 8).map((product) => (
                      <Link
                        key={product.product_id}
                        to={`/product/${product.product_id}`}
                        className="block p-3 rounded-lg bg-white hover:bg-cyan-50 transition-all border border-gray-200 hover:border-cyan-300 hover:shadow-md"
                      >
                        <div className="flex items-start space-x-3">
                          <img 
                            src={product.img_link} 
                            alt={product.product_name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">
                              {product.product_name}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-cyan-600 font-bold">
                                ₹{product.discounted_price.toLocaleString()}
                              </span>
                              <span className="text-amber-600 text-xs">
                                ⭐ {product.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {recommendations.length > 8 && (
                      <Link
                        to="/products"
                        className="block text-center p-3 text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                      >
                        View All {recommendations.length} Recommendations →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-box-open text-3xl mb-3 text-gray-400"></i>
                    <p className="text-sm">No recommendations yet</p>
                    <p className="text-xs mt-1">Add more items to get suggestions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;