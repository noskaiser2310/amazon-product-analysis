import os
from datetime import timedelta

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    
    # Flask
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    
    # CORS
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
    
    # Data paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "amazon.csv")
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    
    # Model paths
    PRICE_MODEL_PATH = os.path.join(MODELS_DIR, "price_prediction", "xgboost_model.joblib")
    RECOMMENDATION_MODEL_PATH = os.path.join(MODELS_DIR, "recommendation", "hybrid_model.joblib")
    
    # Cache settings
    CACHE_TIMEOUT = 3600  # 1 hour
    
    # Pagination
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 1500

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = "development"

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENV = "production"
    CORS_ORIGINS = ["https://yourdomain.com"]

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig
}