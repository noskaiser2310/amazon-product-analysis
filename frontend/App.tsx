import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';  // ✅ NEW
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import PricePredictionPage from './pages/PricePredictionPage'; // ✅ NEW


function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/price-prediction" element={<PricePredictionPage />} /> {/* ✅ NEW */}

          <Route path="/products" element={<ProductsPage />} />  {/* ✅ NEW ROUTE */}
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;