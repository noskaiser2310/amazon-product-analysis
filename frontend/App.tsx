import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import RecommendationsPage from './pages/RecommendationsPage';
import PricePredictionPage from './pages/PricePredictionPage'; // ✅ NEW
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/price-prediction" element={<PricePredictionPage />} /> {/* ✅ NEW */}
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
