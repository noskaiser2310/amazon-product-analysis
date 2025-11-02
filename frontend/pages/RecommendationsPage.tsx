
import React, { useMemo } from 'react';
import { useProductData, useViewedProducts } from '../hooks/useProductData';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { Product } from '../types';

const RecommendationsPage: React.FC = () => {
    const { products, loading, getPopularProducts } = useProductData();
    const { viewed } = useViewedProducts();

    const recommendations = useMemo(() => {
        if (!products.length) return [];
        if (viewed.length === 0) {
            return getPopularProducts(30);
        }

        const viewedProducts = viewed
          .map(id => products.find(p => p.product_id === id))
          // FIX: Replaced .filter(Boolean) as any[] with a type guard to correctly filter and type the array.
          .filter((p): p is Product => Boolean(p));
        
        // Simple hybrid: Mix items from viewed categories and general popular items
        const viewedCategories = new Set(viewedProducts.map(p => p.category_leaf));
        
        // FIX: Explicitly type the recommended array.
        let recommended: Product[] = [];
        
        // Add items from viewed categories
        products.forEach(p => {
            if (viewedCategories.has(p.category_leaf) && !viewed.includes(p.product_id)) {
                recommended.push(p);
            }
        });

        // Fill up with popular items if not enough
        if(recommended.length < 20) {
            const popular = getPopularProducts(40);
            popular.forEach(p => {
                if (recommended.length < 20 && !recommended.find(r => r.product_id === p.product_id) && !viewed.includes(p.product_id)) {
                    recommended.push(p);
                }
            });
        }
        
        // Shuffle and take top 20
        return recommended.sort(() => 0.5 - Math.random()).slice(0, 20);

    }, [products, viewed, getPopularProducts]);

    const message = viewed.length === 0 ? "Popular Products For You" : "Personalized Recommendations";

    return (
        <div>
            <section className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{message}</h1>
                <p className="text-slate-600 mt-2">
                    {viewed.length > 0 ? "Based on your recent activity." : "View some products to get tailored suggestions!"}
                </p>
            </section>
            
            {loading && <div className="h-96"><Spinner /></div>}
            
            {!loading && recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recommendations.map(product => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            )}

            {!loading && recommendations.length === 0 && (
                <div className="text-center py-16">
                    <p>No recommendations to show right now.</p>
                </div>
            )}
        </div>
    );
};

export default RecommendationsPage;
