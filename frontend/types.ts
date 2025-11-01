
export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  category_path: string[];
  category_leaf: string;
  category_top: string;
  discounted_price: number;
  actual_price: number;
  discount_percentage: number;
  rating: number;
  rating_count: number;
  about_product: string;
  img_link: string;
  product_link: string;
}

export interface Filters {
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}
