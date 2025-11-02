import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class ProductDataMapper:
    """Ánh xạ dữ liệu từ CSV sang định dạng Product của React template"""
    
    def __init__(self, csv_path: str):
        """
        Args:
            csv_path: Đường dẫn đến file CSV
        """
        self.csv_path = csv_path
        self.df = None
        self._load_data()
    
    def _load_data(self):
        """Tải dữ liệu từ CSV"""
        try:
            self.df = pd.read_csv(self.csv_path)
            logger.info(f"Loaded {len(self.df)} products from {self.csv_path}")
        except FileNotFoundError:
            logger.error(f"CSV file not found: {self.csv_path}")
            raise
        except Exception as e:
            logger.error(f"Error loading CSV: {str(e)}")
            raise
    
    def _parse_category_path(self, category: str) -> List[str]:
        """
        Parse category string thành array
        
        Ví dụ: "Electronics > Computers > Laptops" → ["Electronics", "Computers", "Laptops"]
        Hoặc nếu có cột category_path riêng, parse từ đó
        """
        if pd.isna(category):
            return []
        
        category_str = str(category).strip('|')
        
        # Nếu đã là list/array, return as is
        if isinstance(category, list):
            return category
        
        # Parse bằng dấu > hoặc |
        if '>' in category_str:
            return [cat.strip() for cat in category_str.split('>')]
        elif '|' in category_str:
            return [cat.strip() for cat in category_str.split('|')]
        else:
            return [category_str]
    
    def _get_category_leaf(self, category_path: List[str]) -> str:
        """Lấy category cuối cùng trong đường dẫn"""
        return category_path[-1] if category_path else "Other"
    
    def _get_category_top(self, category_path: List[str]) -> str:
        """Lấy category đầu tiên trong đường dẫn"""
        return category_path[0] if category_path else "Other"
    
    def _clean_numeric(self, value: Any, default: float = 0.0) -> float:
        """Làm sạch giá trị numeric"""
        try:
            if pd.isna(value):
                return default
            return float(value)
        except (ValueError, TypeError):
            logger.warning(f"Cannot convert {value} to float, using default {default}")
            return default
    
    def _clean_int(self, value: Any, default: int = 0) -> int:
        """Làm sạch giá trị integer"""
        try:
            if pd.isna(value):
                return default
            return int(float(value))
        except (ValueError, TypeError):
            logger.warning(f"Cannot convert {value} to int, using default {default}")
            return default
    
    def _clean_string(self, value: Any, default: str = "") -> str:
        """Làm sạch giá trị string"""
        if pd.isna(value):
            return default
        return str(value).strip()
    
    def map_row_to_product(self, row: pd.Series) -> Dict[str, Any]:
        """
        Ánh xạ một dòng CSV sang định dạng Product của React
        
        Returns:
            Dict với keys: product_id, product_name, category, category_path, 
                          category_leaf, category_top, discounted_price, actual_price,
                          discount_percentage, rating, rating_count, about_product,
                          img_link, product_link
        """
        try:
            # Parse category
            category_str = self._clean_string(row.get('category', ''))
            category_path = self._parse_category_path(category_str)
            
            # Tính discount percentage nếu chưa có
            actual_price = self._clean_numeric(row.get('actual_price', 0))
            discounted_price = self._clean_numeric(row.get('discounted_price', 0))
            
            if discounted_price > 0 and actual_price > 0:
                discount_percentage = self._clean_int(
                    ((actual_price - discounted_price) / actual_price) * 100
                )
            else:
                discount_percentage = self._clean_int(
                    row.get('discount_percentage', 0)
                )
            
            product = {
                "product_id": self._clean_string(row.get('product_id', ''), f"prod_{id(row)}"),
                "product_name": self._clean_string(row.get('product_name', ''), "Unknown Product"),
                "category": category_str,
                "category_path": category_path,
                "category_leaf": self._get_category_leaf(category_path),
                "category_top": self._get_category_top(category_path),
                "discounted_price": max(0, discounted_price),
                "actual_price": max(0, actual_price),
                "discount_percentage": max(0, min(100, discount_percentage)),
                "rating": max(0, min(5, self._clean_numeric(row.get('rating', 0)))),
                "rating_count": max(0, self._clean_int(row.get('rating_count', 0))),
                "about_product": self._clean_string(row.get('about_product', '')),
                "img_link": self._clean_string(row.get('img_link', '')),
                "product_link": self._clean_string(row.get('product_link', ''))
            }
            
            return product
        
        except Exception as e:
            logger.error(f"Error mapping row to product: {str(e)}")
            raise
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Lấy tất cả products đã chuẩn hóa"""
        if self.df is None:
            return []
        
        products = []
        for idx, row in self.df.iterrows():
            try:
                product = self.map_row_to_product(row)
                products.append(product)
            except Exception as e:
                logger.warning(f"Skipping row {idx}: {str(e)}")
                continue
        
        return products
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Lấy product theo ID"""
        if self.df is None:
            return None
        
        row = self.df[self.df['product_id'] == product_id]
        if row.empty:
            return None
        
        return self.map_row_to_product(row.iloc[0])
    
    def get_unique_categories(self) -> List[str]:
        """Lấy danh sách unique categories (category_top)"""
        if self.df is None:
            return []
        
        categories = set()
        for category_str in self.df['category'].dropna():
            path = self._parse_category_path(category_str)
            if path:
                categories.add(path[0])
        
        return sorted(list(categories))
    
    def search_products(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Tìm kiếm products theo tên hoặc category"""
        if self.df is None or not query:
            return []
        
        query_lower = query.lower()
        mask = (
            self.df['product_name'].str.lower().str.contains(query_lower, na=False) |
            self.df['category'].str.lower().str.contains(query_lower, na=False)
        )
        
        results = []
        for idx, row in self.df[mask].head(limit).iterrows():
            try:
                product = self.map_row_to_product(row)
                results.append(product)
            except Exception as e:
                logger.warning(f"Error in search for row {idx}: {str(e)}")
                continue
        
        return results
    
    def filter_products(self, 
                       category: Optional[str] = None,
                       min_price: Optional[float] = None,
                       max_price: Optional[float] = None,
                       min_rating: Optional[float] = None,
                       limit: int = 500) -> List[Dict[str, Any]]:
        """Lọc products theo các tiêu chí"""
        if self.df is None:
            return []
        
        df_filtered = self.df.copy()
        
        # Filter by category
        if category:
            mask = df_filtered['category'].str.contains(category, na=False, case=False)
            df_filtered = df_filtered[mask]
        
        # Filter by price range
        if min_price is not None:
            df_filtered = df_filtered[df_filtered['discounted_price'] >= min_price]
        
        if max_price is not None:
            df_filtered = df_filtered[df_filtered['discounted_price'] <= max_price]
        
        # Filter by minimum rating
        if min_rating is not None:
            df_filtered = df_filtered[df_filtered['rating'] >= min_rating]
        
        results = []
        for idx, row in df_filtered.head(limit).iterrows():
            try:
                product = self.map_row_to_product(row)
                results.append(product)
            except Exception as e:
                logger.warning(f"Error in filter for row {idx}: {str(e)}")
                continue
        
        return results