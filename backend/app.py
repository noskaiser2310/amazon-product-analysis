import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from functools import wraps

from config import config
from data_mapper import ProductDataMapper
from models_service import ModelsService

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Load config
env = os.getenv("FLASK_ENV", "development")
app.config.from_object(config[env])

# Initialize CORS
CORS(app, 
     origins=app.config['CORS_ORIGINS'],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

# Global services
data_mapper = None
models_service = None

def init_services():
    """Initialize services khi app start"""
    global data_mapper, models_service
    
    try:
        data_mapper = ProductDataMapper(app.config['DATA_PATH'])
        logger.info("Data mapper initialized")
    except Exception as e:
        logger.error(f"Failed to initialize data mapper: {str(e)}")
        raise
    
    try:
        models_service = ModelsService(
            app.config['PRICE_MODEL_PATH'],
            app.config['RECOMMENDATION_MODEL_PATH']
        )
        logger.info("Models service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize models service: {str(e)}")

def error_handler(func):
    """Decorator để handle errors trong routes"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as e:
            return jsonify({"error": f"Invalid input: {str(e)}"}), 400
        except KeyError as e:
            return jsonify({"error": f"Missing required field: {str(e)}"}), 400
        except Exception as e:
            logger.error(f"Unhandled error in {func.__name__}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500
    return wrapper

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": app.config['ENV']
    }), 200

@app.route('/api/products', methods=['GET'])
@error_handler
def get_products():
    """
    Lấy danh sách products
    
    Query parameters:
        - limit: Số lượng products (default: 20, max: 100)
        - search: Tìm kiếm theo tên/category
        - category: Lọc theo category
        - min_price: Giá tối thiểu
        - max_price: Giá tối đa
        - min_rating: Đánh giá tối thiểu
    """
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, app.config['MAX_PAGE_SIZE'])
    
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    
    # Validate inputs
    if min_price is not None and min_price < 0:
        return jsonify({"error": "min_price cannot be negative"}), 400
    if max_price is not None and max_price < 0:
        return jsonify({"error": "max_price cannot be negative"}), 400
    if min_rating is not None and not (0 <= min_rating <= 5):
        return jsonify({"error": "min_rating must be between 0 and 5"}), 400
    
    # Get products
    if search:
        products = data_mapper.search_products(search, limit=limit)
    else:
        products = data_mapper.filter_products(
            category=category if category else None,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            limit=limit
        )
    
    return jsonify({
        "data": products,
        "count": len(products),
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/api/products/<product_id>', methods=['GET'])
@error_handler
def get_product_detail(product_id):
    """Lấy chi tiết một sản phẩm"""
    product = data_mapper.get_product_by_id(product_id)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    return jsonify({
        "data": product,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/api/categories', methods=['GET'])
@error_handler
def get_categories():
    """Lấy danh sách tất cả categories"""
    categories = data_mapper.get_unique_categories()
    
    return jsonify({
        "data": categories,
        "count": len(categories),
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/api/recommendations/<product_id>', methods=['GET'])
@error_handler
def get_recommendations(product_id):
    """
    Lấy sản phẩm gợi ý
    
    Query parameters:
        - count: Số lượng gợi ý (default: 5, max: 20)
    """
    count = request.args.get('count', 5, type=int)
    count = min(count, 20)
    
    if not models_service:
        return jsonify({"error": "Recommendation service not available"}), 503
    
    all_products = data_mapper.get_all_products()
    recommendations = models_service.get_recommendations(
        product_id,
        all_products,
        count=count
    )
    
    return jsonify({
        "data": recommendations,
        "count": len(recommendations),
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/api/price-prediction', methods=['POST'])
@error_handler
def predict_price():
    """
    Dự đoán giá sản phẩm
    
    Request body:
    {
        "product_name": str,
        "category": str,
        "rating": float (0-5),
        "rating_count": int,
        "actual_price": float
    }
    """
    if not models_service:
        return jsonify({"error": "Model service not available"}), 503
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    # Validate required fields
    required_fields = ['product_name', 'category', 'rating', 'rating_count', 'actual_price']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    prediction = models_service.predict_price(
        product_name=data['product_name'],
        category=data['category'],
        rating=float(data['rating']),
        rating_count=int(data['rating_count']),
        actual_price=float(data['actual_price'])
    )
    
    if prediction is None:
        return jsonify({"error": "Prediction failed"}), 500
    
    return jsonify({
        "data": prediction,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/api/search', methods=['POST'])
@error_handler
def search():
    """
    Search products
    
    Request body:
    {
        "query": str,
        "limit": int (optional, default: 20)
    }
    """
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Query is required"}), 400
    
    query = data['query'].strip()
    limit = data.get('limit', 20)
    limit = min(limit, app.config['MAX_PAGE_SIZE'])
    
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    
    results = data_mapper.search_products(query, limit=limit)
    
    return jsonify({
        "data": results,
        "count": len(results),
        "query": query,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize services
    init_services()
    
    # Run server
    debug = app.config['DEBUG']
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    
    app.run(host=host, port=port, debug=debug)