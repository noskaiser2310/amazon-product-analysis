import React from 'react';
import PricePredictionCard from '../components/PricePredictionCard';

const PricePredictionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-8 px-6 rounded-lg shadow-lg mb-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2">
          <i className="fas fa-brain mr-3"></i>
          AI-Powered Price Prediction
        </h1>
        <p className="text-lg opacity-90">
          Leverage machine learning to predict optimal product pricing
        </p>
      </section>

      <div className="space-y-8">
        <PricePredictionCard />

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-600"></i>
            How it works
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span>
                Our <strong>Random Forest ML model</strong> analyzes product features including 
                name, category, ratings, and original price.
              </span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span>
                The model has been trained on <strong>thousands of Amazon products</strong> with 
                an accuracy of <strong>96%</strong> (R² = 0.9597).
              </span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span>
                It predicts the optimal discounted price that balances <strong>competitiveness 
                and profitability</strong>.
              </span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span>
                Use these predictions to <strong>optimize your pricing strategy</strong> and 
                maximize sales.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
            <i className="fas fa-lightbulb mr-2 text-amber-500"></i>
            Tips for best results
          </h3>
          <ul className="space-y-2 text-gray-700 list-disc list-inside">
            <li>Enter <strong>accurate product information</strong> for better predictions</li>
            <li>Use <strong>specific categories</strong> (e.g., "Electronics , Laptops" instead of just "Electronics")</li>
            <li>Ensure rating values are realistic (typically between 3.0 - 5.0)</li>
            <li>Compare predictions with <strong>market research</strong> before applying</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionPage;