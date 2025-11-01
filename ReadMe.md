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
├── README.md                    # Project overview
├── requirements.txt             # Dependencies  
├── .gitignore                  # Ignore data/models
│
├── data/                       
│   ├── amazon_products.csv     # Raw dataset (gitignored)
│   └── Overview.md              # Dataset description
│
├── notebooks/                  
│   ├── 01_data_processing.ipynb        # Data cleaning + preprocessing
│   ├── 02_visualization.ipynb          # EDA + all visualizations  
│   ├── 03_rating_prediction.ipynb      # Rating prediction models
│   └── 04_recommendation_system.ipynb  # Recommendation system
│
├── models/                     # Saved models (gitignored)
│   ├── best_rating_model.pkl
│   └── best_recommender.pkl
│
├── app/                       # Deployment only
│   ├── app.py                # Streamlit app
│   └── utils.py              # Helper functions cho app
│
│
├── reports/                          # Reports & presentations
│   ├── figures/                      # Generated figures
│   ├── eda_report.pdf                # EDA insights
│   ├── model_comparison.pdf          # Model performance comparison
│   ├── final_report.pdf              # Final project report
│   └── presentation.pptx             # Presentation slides

```
