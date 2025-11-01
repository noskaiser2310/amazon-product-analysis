import joblib
import logging
from typing import Dict, List, Optional, Any
import numpy as np

logger = logging.getLogger(__name__)

class ModelsService:
    """Service để load và sử dụng ML models"""
    
    def __init__(self, price_model_path: str, recommendation_model_path: str):
        """
        Args:
            price_model_path: Đường dẫn tới price prediction model
            recommendation_model_path: Đường dẫn tới recommendation model
        """
        self.price_model = None
        self.recommendation_model = None
        self._load_models(price_model_path, recommendation_model_path)



    def _load_models(self, price_model_path: str, recommendation_model_path: str):
            loaded_data = joblib.load(price_model_path)
            
            # ✅ FIX: Xử lý cả dict và object
            if isinstance(loaded_data, dict):
                self.price_model = loaded_data.get('model')
                self.price_scaler = loaded_data.get('scaler')
            else:
                self.price_model = loaded_data

    
    def predict_price(self, 
                     product_name: str,
                     category: str,
                     rating: float,
                     rating_count: int,
                     actual_price: float) -> Optional[Dict[str, Any]]:
        """
        Dự đoán giá bán cho sản phẩm
        
        Args:
            product_name: Tên sản phẩm
            category: Danh mục sản phẩm
            rating: Đánh giá từ 1-5
            rating_count: Số lượng đánh giá
            actual_price: Giá gốc
        
        Returns:
            Dict với predicted_price hoặc None nếu model không available
        """
        if self.price_model is None:
            logger.warning("Price model not available")
            return None
        
        try:
            # Preparation features (tuỳ theo model của bạn)
            # Đây là ví dụ, bạn cần điều chỉnh theo features của model thực tế
            features = np.array([[
                len(product_name),
                hash(category) % 1000,
                rating,
                min(rating_count, 10000),
                actual_price
            ]])
            
            predicted_price = self.price_model.predict(features)[0]
            
            return {
                "original_price": float(actual_price),
                "predicted_price": float(max(0, predicted_price)),
                "confidence": 0.85
            }
        
        except Exception as e:
            logger.error(f"Error predicting price: {str(e)}")
            return None
    
    def get_recommendations(self, 
                           product_id: str,
                           all_products: List[Dict[str, Any]],
                           count: int = 5) -> List[Dict[str, Any]]:
        """
        Lấy gợi ý sản phẩm tương tự
        
        Args:
            product_id: ID sản phẩm hiện tại
            all_products: Danh sách tất cả sản phẩm
            count: Số lượng gợi ý
        
        Returns:
            Danh sách sản phẩm gợi ý
        """
        try:
            # Tìm product hiện tại
            current_product = None
            for p in all_products:
                if p['product_id'] == product_id:
                    current_product = p
                    break
            
            if not current_product:
                return []
            
            # Content-based recommendation: tìm sản phẩm cùng category
            # với rating cao hơn
            recommended = []
            for product in all_products:
                if (product['product_id'] != product_id and
                    product['category_leaf'] == current_product['category_leaf']):
                    recommended.append({
                        'product': product,
                        'similarity_score': product['rating']
                    })
            
            # Sort by rating giảm dần
            recommended.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top N
            return [item['product'] for item in recommended[:count]]
        
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
    