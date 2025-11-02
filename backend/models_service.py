import joblib
import logging
from typing import Dict, List, Optional, Any, Union
import numpy as np
from scipy.sparse import csr_matrix

logger = logging.getLogger(__name__)

class ModelsService:
    """Service để load và sử dụng ML models"""
    
    def __init__(self, price_model_path: str, recommendation_model_path: str):
        self.price_model = None
        self.recommendation_model = None
        self.recommendation_artifacts = None
        self._load_models(price_model_path, recommendation_model_path)
    
    def _load_models(self, price_model_path: str, recommendation_model_path: str):
        """Load models từ disk"""
        try:
            loaded_data = joblib.load(price_model_path)
            
            if isinstance(loaded_data, dict):
                self.price_model = loaded_data.get('model')
                logger.info("Price model loaded from dict format")
            else:
                self.price_model = loaded_data
                logger.info("Price model loaded as object")
            
            if self.price_model is None:
                logger.warning("Price model is None after loading")
            else:
                logger.info("✅ Price prediction model loaded successfully")
        
        except FileNotFoundError:
            logger.warning(f"Price model not found: {price_model_path}")
        except Exception as e:
            logger.error(f"Error loading price model: {str(e)}")
        
        try:
            self.recommendation_artifacts = joblib.load(recommendation_model_path)
            
            if self.recommendation_artifacts is None:
                logger.warning("Recommendation artifacts are None after loading")
            else:
                logger.info("✅ Hybrid recommendation model artifacts loaded successfully")
                logger.info(f"Available artifacts: {list(self.recommendation_artifacts.keys())}")
        
        except FileNotFoundError:
            logger.warning(f"Recommendation model not found: {recommendation_model_path}")
        except Exception as e:
            logger.error(f"Error loading recommendation model: {str(e)}")

    def _recommend_collab(self, user_id: str, top_k: int = 10) -> List[str]:
        """Generate collaborative filtering recommendations"""
        try:
            enc = {
                "user": self.recommendation_artifacts["user_encoder"],
                "product": self.recommendation_artifacts["product_encoder"]
            }
            U = self.recommendation_artifacts["U"]
            V = self.recommendation_artifacts["V"]
            pop_rank = self.recommendation_artifacts["pop_rank"]
            
            # Encode user_id
            if user_id not in enc["user"].classes_:
                logger.warning(f"User ID {user_id} not in training data")
                return []
            
            user_idx = enc["user"].transform([user_id])[0]
            
            # Calculate predicted ratings
            user_vector = U[user_idx]
            predicted_ratings = user_vector @ V.T
            
            # Get top K recommendations
            top_indices = np.argsort(predicted_ratings)[::-1][:top_k]
            
            # Convert back to product IDs
            recommended_product_ids = enc["product"].inverse_transform(top_indices)
            
            return recommended_product_ids.tolist()
            
        except Exception as e:
            logger.error(f"Error in collaborative recommendation: {str(e)}")
            return []

    def _recommend_content_based_single(self, product_id: str, top_k: int = 5) -> List[str]:
        """Generate content-based recommendations for single product"""
        try:
            content_pid2idx = self.recommendation_artifacts["content_pid2idx"]
            content_idx2pid = self.recommendation_artifacts["content_idx2pid"]
            content_similarity = self.recommendation_artifacts["content_similarity"]
            
            if product_id not in content_pid2idx:
                logger.warning(f"Product ID {product_id} not in content model")
                return []
            
            product_idx = content_pid2idx[product_id]
            similar_indices = np.argsort(content_similarity[product_idx])[::-1][1:top_k+1]
            
            recommended_product_ids = [content_idx2pid[idx] for idx in similar_indices]
            return recommended_product_ids
            
        except Exception as e:
            logger.error(f"Error in content-based recommendation for single product: {str(e)}")
            return []

    def _recommend_content_based_multiple(self, product_ids: List[str], top_k: int = 10) -> List[str]:
        """Generate content-based recommendations for multiple products"""
        try:
            content_pid2idx = self.recommendation_artifacts["content_pid2idx"]
            content_idx2pid = self.recommendation_artifacts["content_idx2pid"]
            content_similarity = self.recommendation_artifacts["content_similarity"]
            
            # Lấy indices của tất cả products
            product_indices = []
            valid_product_ids = []
            
            for pid in product_ids:
                if pid in content_pid2idx:
                    product_indices.append(content_pid2idx[pid])
                    valid_product_ids.append(pid)
                else:
                    logger.warning(f"Product ID {pid} not in content model")
            
            if not product_indices:
                return []
            
            # Tính similarity tổng hợp từ nhiều products
            similarity_scores = {}
            
            for idx in product_indices:
                # Lấy top 2*top_k sản phẩm tương tự cho mỗi product
                similar_indices = np.argsort(content_similarity[idx])[::-1][1:top_k*2+1]
                
                for similar_idx in similar_indices:
                    similar_pid = content_idx2pid[similar_idx]
                    # Chỉ thêm nếu không phải là product đầu vào
                    if similar_pid not in valid_product_ids:
                        current_score = content_similarity[idx][similar_idx]
                        similarity_scores[similar_pid] = similarity_scores.get(similar_pid, 0) + current_score
            
            # Sắp xếp theo similarity score và lấy top_k
            sorted_recommendations = sorted(similarity_scores.items(), 
                                         key=lambda x: x[1], reverse=True)[:top_k]
            
            return [pid for pid, score in sorted_recommendations]
            
        except Exception as e:
            logger.error(f"Error in content-based recommendation for multiple products: {str(e)}")
            return []

    def _prepare_price_features(self,
                               actual_price: float,
                               rating: float,
                               rating_count: int) -> np.ndarray:
        """
        Chuẩn bị features cho price prediction
        """
        try:
            is_popular = 1 if rating_count > 1000 else 0
            
            features = np.array([[
                actual_price,
                rating,
                rating_count,
                is_popular
            ]])
            
            return features
        
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return np.array([[0, 0, 0, 0]])
    
    def predict_price(self, 
                     actual_price: float,
                     rating: float,
                     rating_count: int) -> Optional[Dict[str, Any]]:
        """
        Dự đoán giá bán cho sản phẩm
        """
        if self.price_model is None:
            logger.warning("Price model not available")
            return None
        
        try:
            features = self._prepare_price_features(actual_price, rating, rating_count)
            
            if not hasattr(self.price_model, 'predict'):
                logger.error(f"Model không có method 'predict'. Type: {type(self.price_model)}")
                return None
            
            predicted_price = float(self.price_model.predict(features)[0])
            
            # Ensure predicted price is reasonable
            predicted_price = max(100, min(predicted_price, actual_price * 2))
            
            return {
                "original_price": float(actual_price),
                "predicted_price": predicted_price,
                "confidence": 0.92
            }
        
        except Exception as e:
            logger.error(f"Error predicting price: {str(e)}")
            return None
    
    def get_recommendations(self, 
                           product_id: Optional[Union[str, List[str]]] = None,
                           user_id: str = None,
                           all_products: List[Dict[str, Any]] = None,
                           count: int = 10) -> List[Dict[str, Any]]:
        """
        Lấy gợi ý sản phẩm sử dụng hybrid model
        
        Args:
            product_id: ID sản phẩm hiện tại (string) hoặc danh sách ID sản phẩm (list)
            user_id: ID người dùng (cho collaborative filtering)
            all_products: Danh sách tất cả sản phẩm (để lấy thông tin)
            count: Số lượng gợi ý
        
        Returns:
            Danh sách sản phẩm gợi ý
        """
        if self.recommendation_artifacts is None:
            logger.warning("Recommendation model not available")
            return []

        try:
            recommended_product_ids = []

            # Ưu tiên collaborative filtering nếu có user_id
            if user_id:
                collab_recs = self._recommend_collab(user_id, count)
                recommended_product_ids.extend(collab_recs)
                logger.info(f"Generated {len(collab_recs)} collaborative recommendations for user {user_id}")
            
            # Xử lý content-based recommendations
            content_based_recs = []
            if product_id:
                if isinstance(product_id, str):
                    # Single product
                    content_based_recs = self._recommend_content_based_single(product_id, count)
                    logger.info(f"Generated {len(content_based_recs)} content-based recommendations for single product {product_id}")
                elif isinstance(product_id, list) and len(product_id) > 0:
                    # Multiple products
                    if len(product_id) == 1:
                        content_based_recs = self._recommend_content_based_single(product_id[0], count)
                    else:
                        content_based_recs = self._recommend_content_based_multiple(product_id, count)
                    logger.info(f"Generated {len(content_based_recs)} content-based recommendations for {len(product_id)} products")
            
            # Kết hợp recommendations (loại bỏ trùng lặp)
            for rec in content_based_recs:
                if rec not in recommended_product_ids:
                    recommended_product_ids.append(rec)
                if len(recommended_product_ids) >= count * 2:  # Giới hạn để tránh quá nhiều
                    break

            # Lấy thông tin đầy đủ của sản phẩm được recommend
            recommended_products = []
            if all_products and recommended_product_ids:
                product_map = {p['product_id']: p for p in all_products}
                
                for pid in recommended_product_ids[:count]:
                    if pid in product_map:
                        recommended_products.append(product_map[pid])
                    else:
                        logger.warning(f"Recommended product {pid} not found in product list")

            logger.info(f"Final recommendations: {len(recommended_products)} products")
            return recommended_products

        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []

    def get_recommendations_for_user(self, user_id: str, all_products: List[Dict[str, Any]], count: int = 10) -> List[Dict[str, Any]]:
        """Lấy gợi ý cho người dùng cụ thể"""
        return self.get_recommendations(user_id=user_id, all_products=all_products, count=count)

    def get_recommendations_for_products(self, 
                                       product_ids: List[str], 
                                       all_products: List[Dict[str, Any]], 
                                       count: int = 10) -> List[Dict[str, Any]]:
        """Lấy gợi ý dựa trên nhiều sản phẩm"""
        return self.get_recommendations(product_id=product_ids, all_products=all_products, count=count)

    def get_hybrid_recommendations(self,
                                 user_id: str = None,
                                 product_ids: List[str] = None,
                                 all_products: List[Dict[str, Any]] = None,
                                 count: int = 10) -> List[Dict[str, Any]]:
        """Lấy gợi ý hybrid kết hợp user và multiple products"""
        return self.get_recommendations(
            user_id=user_id,
            product_id=product_ids,
            all_products=all_products,
            count=count
        )