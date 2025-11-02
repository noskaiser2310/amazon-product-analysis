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
  
  // ✅ Recommendations từ REAL MODEL
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

  // ✅ FETCH REAL MODEL RECOMMENDATIONS - Thay đổi liên tục mỗi khi cart thay đổi
  useEffect(() => {
    if (cart.items.length === 0) {
      setRecommendations([]);
      console.log("🛒 Cart empty - no recommendations");
      return;
    }

    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        console.log(`📊 Fetching recommendations for ${cart.items.length} cart items...`);
        
        // ✅ Gọi endpoint /api/recommendations với cart items
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
          setSortBy('recommended');  // Reset sort order khi fetch mới
          console.log(`✅ Fetched ${result.data.length} recommendations using REAL MODEL`);
          
          // Debug: Log top 3 recommendations
          if (result.data.length > 0) {
            console.log("Top 3 recommendations:");
            result.data.slice(0, 3).forEach((rec, i) => {
              console.log(`  ${i+1}. ${rec.product_name} (₹${rec.discounted_price})`);
            });
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [cart.items, fetchData]);

  // ✅ Sorting logic
  const sortedRecommendations = useMemo(() => {
    let sorted = [...recommendations];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.discounted_price - b.discounted_price);
        console.log("📈 Sorted: Price Low to High");
        break;
      case 'price-high':
        sorted.sort((a, b) => b.discounted_price - a.discounted_price);
        console.log("📉 Sorted: Price High to Low");
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        console.log("⭐ Sorted: Rating (High to Low)");
        break;
      case 'recommended':
      default:
        console.log("🎯 Sorted: AI Recommended (Original Model Order)");
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
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {(['cart', 'shipping', 'payment'] as const).map((step, index) => (
          <React.Fragment key={step}>
            <div className={`flex items-center space-x-2 ${checkoutStep === step ? 'text-cyan-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                checkoutStep === step ? 'bg-cyan-600 text-white' : 'bg-gray-200'
              }`}>
                {index + 1}
              </div>
              <span className="font-semibold capitalize">{step}</span>
            </div>
            {index < 2 && <div className="flex-1 h-1 bg-gray-200 mx-4"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {checkoutStep === 'cart' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
              
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
                    <div key={item.product_id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <img src={item.img_link} alt={item.product_name} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-slate-800">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
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
                  placeholder="Full Name"
                  value={shippingData.name}
                  onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={shippingData.address}
                  onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingData.city}
                    onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Zipcode"
                    value={shippingData.zipcode}
                    onChange={(e) => setShippingData({...shippingData, zipcode: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Details (DEMO)</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>DEMO MODE</strong>: Use any card details
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Card Number"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  maxLength="19"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    maxLength="3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Order Summary + Recommendations */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span>Items ({cart.items.length})</span>
                <span>₹{cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (10%)</span>
                <span>₹{Math.round(cart.total * 0.1).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span className="text-cyan-600">₹{(cart.total * 1.1).toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.items.length === 0}
              className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {checkoutStep === 'cart' ? 'Proceed to Shipping' : checkoutStep === 'shipping' ? 'Proceed to Payment' : 'Complete Order'}
            </button>
          </div>

          {/* ✅ REAL MODEL Recommendations with Sorting */}
          {checkoutStep === 'cart' && (
            <div className="bg-gradient-to-b from-cyan-50 to-transparent rounded-lg p-6 border border-cyan-200">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <i className="fas fa-brain text-cyan-600 mr-2"></i>
                AI Recommendations ({recommendations.length})
              </h3>
              
              {/* Sort Controls */}
              <div className="mb-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="recommended">🎯 Model Recommended</option>
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sortedRecommendations.map((product, index) => (
                    <Link
                      key={product.product_id}
                      to={`/product/${product.product_id}`}
                      className="block p-3 rounded-lg hover:bg-white transition-all border border-transparent hover:border-cyan-300 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-2">
                        <img 
                          src={product.img_link} 
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">{product.product_name}</p>
                          <div className="flex justify-between items-center mt-1 text-xs">
                            <span className="text-cyan-600 font-bold">₹{product.discounted_price.toLocaleString()}</span>
                            <span className="text-amber-600">⭐ {product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <i className="fas fa-inbox text-2xl mb-2"></i>
                  <p className="text-sm">No recommendations available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
