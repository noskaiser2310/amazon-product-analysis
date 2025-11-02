import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface PricePredictionResult {
  original_price: number;
  predicted_price: number;
  confidence: number;
}

const PricePredictionCard: React.FC = () => {
  const [formData, setFormData] = useState({
    actual_price: 0,
    rating: 4.0,
    rating_count: 100
  });
  
  const [prediction, setPrediction] = useState<PricePredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchData } = useApi();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'actual_price' || name === 'rating_count' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await fetchData<PricePredictionResult>('/price-prediction', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result?.data) {
        setPrediction(result.data);
      } else {
        throw new Error(result?.error || 'Prediction failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to predict price';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      actual_price: 0,
      rating: 4.0,
      rating_count: 100
    });
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-slate-800 flex items-center">
        <i className="fas fa-calculator mr-2 text-cyan-600"></i>
        Price Prediction Tool
      </h3>
      <p className="text-gray-600 mb-6">
        Use our ML model to predict optimal pricing based on 3 key features.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (₹)
            </label>
            <input
              type="number"
              name="actual_price"
              value={formData.actual_price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              required
              min="0"
              max="5"
              step="0.1"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Ratings
            </label>
            <input
              type="number"
              name="rating_count"
              value={formData.rating_count}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Predicting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-magic mr-2"></i>
                Predict Price
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-6 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </p>
        </div>
      )}

      {prediction && (
        <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-chart-line mr-2 text-cyan-600"></i>
            Prediction Results
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Original Price</p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{prediction.original_price.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Predicted Optimal Price</p>
              <p className="text-2xl font-bold text-cyan-600">
                ₹{prediction.predicted_price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Model Confidence</span>
              <span className="text-sm font-semibold text-slate-800">
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-cyan-100 rounded-md">
            <p className="text-sm text-cyan-800">
              {prediction.predicted_price < prediction.original_price ? (
                <>
                  <i className="fas fa-arrow-down mr-2"></i>
                  <strong>Recommendation:</strong> Consider pricing at ₹
                  {prediction.predicted_price.toLocaleString()} (
                  {(((prediction.original_price - prediction.predicted_price) / prediction.original_price) * 100).toFixed(1)}% 
                  lower) for market competitiveness.
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-up mr-2"></i>
                  <strong>Recommendation:</strong> You can increase price to ₹
                  {prediction.predicted_price.toLocaleString()} (
                  {(((prediction.predicted_price - prediction.original_price) / prediction.original_price) * 100).toFixed(1)}% 
                  higher) based on features.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricePredictionCard;