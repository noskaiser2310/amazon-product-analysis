# Amazon Product Analysis: Rating Prediction & Recommendation System

## Project Overview
Dual machine learning system for e-commerce:
1. Rating Prediction from review text
2. Product Recommendation System

## Team
- Nguyễn Văn Sơn : Data Scientist
- Nguyễn Hoàng Thắng : AI Engineer
- Vũ Hải Đăng: Data Analyst
- Dương Đình Hiếu : AI Engineer


## Project structure
```

amazon-product-analysis/
│
├── README.md                          # Project overview, setup instructions
├── requirements.txt                   # Python dependencies
├── .gitignore                       
│
├── data/                             # Data folder (gitignored)
│   ├── raw/
│   │   └── amazon_products.csv       # Original dataset
│   ├── processed/
│   │   ├── train.csv                 # Training set
│   │   ├── val.csv                   # Validation set
│   │   └── test.csv                  # Test set
│   └── interim/
│       └── cleaned_data.csv          # After cleaning
│
├── notebooks/                        # Jupyter notebooks
│   ├── 01_data_exploration.ipynb     # EDA 
│   ├── 02_feature_engineering.ipynb  # Feature engineering 
│   ├── 03_rating_prediction.ipynb    # Rating models
│   ├── 04_recommendation_system.ipynb # Recommendation models
│   └── 05_model_evaluation.ipynb     # Evaluation & comparison 
│
├── src/                              # Source code
│   ├── __init__.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── load_data.py              # Data loading functions
│   │   ├── preprocess.py             # Preprocessing pipeline
│   │   └── feature_engineering.py    # Feature extraction
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── rating_prediction.py      # Rating prediction models
│   │   ├── recommendation.py         # Recommendation models
│   │   ├── baseline.py               # Baseline implementations
│   │   └── ensemble.py               # Ensemble methods
│   │
│   ├── evaluation/
│   │   ├── __init__.py
│   │   ├── metrics.py                # Evaluation metrics implementation
│   │   └── visualization.py          # Plots and charts
│   │
│   └── utils/
│       ├── __init__.py
│       ├── config.py                 # Configuration constants
│       └── helpers.py                # Utility functions
│
├── models/                           # Saved models (gitignored)
│   ├── rating_prediction/
│   │   ├── baseline_lr.pkl
│   │   ├── xgboost_final.pkl
│   │   └── phobert_finetuned/
│   │
│   └── recommendation/
│       ├── svd_model.pkl
│       ├── item_similarity_matrix.npy
│       └── hybrid_recommender.pkl
│
├── app/                              # Deployment 
│   ├── app.py                        # Streamlit main app
│   ├── pages/
│   │   ├── 1_rating_prediction.py    # Rating prediction page
│   │   └── 2_recommendations.py      # Recommendation page
│   ├── utils/
│   │   ├── load_models.py            # Model loading
│   │   └── display.py                # UI components
│   └── assets/
│       ├── logo.png
│       └── style.css
│
├── tests/                            # Unit tests
│   ├── test_preprocessing.py
│   ├── test_models.py
│   └── test_metrics.py
│
├── docs/                             # Documentation 
│   ├── problem_statement.pdf         
│   ├── data_dictionary.md            # Feature descriptions
│   ├── model_cards/
│   │   ├── rating_prediction.md      # Model details
│   │   └── recommendation.md
│   ├── metrics_definition.md         # Metrics explanation
│   └── user_guide.md                 # How to use the app
│
├── reports/                          # Reports & presentations
│   ├── figures/                      # Generated figures
│   ├── eda_report.pdf                # EDA insights
│   ├── model_comparison.pdf          # Model performance comparison
│   ├── final_report.pdf              # Final project report
│   └── presentation.pptx             # Presentation slides
│
└── scripts/                          # Executable scripts
    ├── train_rating_model.py         # Training script
    ├── train_recommender.py          # Training script
    ├── evaluate_models.py            # Evaluation script
    └── generate_predictions.py       # Batch prediction
```
