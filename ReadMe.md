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

Price Prediction Tool
Use our ML model to predict optimal pricing for products based on features.

Product Name
Wayona Type C To Lightning Cable Apple Mfi Certified 27W iPhone 14 Charger Wire Compatible With iPhone 14/13 Pro/13 Pro Max/12 Pro/11 Pro Max/X/XS/XR/8, I-Pad 9Th 2021, Airpods Pro (1.5M, Grey)
Category
Computers & Accessories,Accessories & Peripherals,Cables & Accessories,Cables›Lightning Cables
Rating (1-5)
4.1
Number of Ratings
1616
Actual/Original Price (₹)

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
