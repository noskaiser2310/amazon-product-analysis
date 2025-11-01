# -*- coding: utf-8 -*-
"""
Flask Recommender App — v2.1 (fixed category path + template fallback)

Fixes in this patch
- Correctly parses hierarchical category: e.g. "Computers&Accessories|Accessories&Peripherals|…|USBCables"
  • Adds columns: category_path (list[str]), category_leaf (last segment), category_top (first segment)
  • Search/filter now match against ANY segment (case‑insensitive)
- Cleans numeric fields robustly: rating_count (e.g. "43,994"), % sign, ₹ symbol
- Normalizes image links when stored as Markdown: [url](url) → takes the URL inside (...)
- Content‑based: still uses TF‑IDF from saved model; fallback uses category_leaf similarity
- Adds JSON debug endpoint: /api/product/<product_id>
- Prevents 500 TemplateNotFound by providing inline fallback HTML if template files are missing

Run:
  set RECSYS_MODEL_DIR=D:\\Study\\School\\ADY\\amazon-product-analysis\\models\\recommendation
  python flask_recsys_app_v2.py
"""

from flask import Flask, render_template, render_template_string, jsonify, request, session
import pandas as pd
import numpy as np
import os, json, re
from datetime import datetime
from joblib import load
from jinja2 import TemplateNotFound

app = Flask(__name__)
app.secret_key = '132213'

# ============================================================
# CONFIG
# ============================================================
DEFAULT_MODEL_DIR = r'D:\\Study\\School\\ADY\\amazon-product-analysis\\models\\recommendation'
MODEL_DIR = os.getenv('RECSYS_MODEL_DIR', DEFAULT_MODEL_DIR)
MODEL_FILE = os.path.join(MODEL_DIR, 'hybrid_model.joblib')
MANIFEST_FILE = os.path.join(MODEL_DIR, 'manifest.json')

DATA_PATH = 'data/raw/amazon.csv'

# ============================================================
# LOAD DATA
# ============================================================
print('Loading catalog...')

df = pd.read_csv(DATA_PATH)

products = df[[
    'product_id', 'product_name', 'category',
    'discounted_price', 'actual_price', 'discount_percentage',
    'rating', 'rating_count', 'about_product',
    'img_link', 'product_link'
]].drop_duplicates(subset=['product_id']).copy()

# ---------- Cleaning helpers ----------
_md_url_pattern = re.compile(r"\((https?://[^)\s]+)\)")

def _normalize_img_link(x: str) -> str:
    if pd.isna(x):
        return None
    s = str(x).strip()
    # If markdown style [..](..), extract the (...) URL
    m = _md_url_pattern.search(s)
    if m:
        return m.group(1)
    return s

# Clean price-like fields (₹, %, commas)
for col, repl in [
    ('discounted_price', r'[₹,]'),
    ('actual_price', r'[₹,]'),
]:
    if col in products.columns:
        products[col] = products[col].astype(str).str.replace(repl, '', regex=True)
        products[col] = pd.to_numeric(products[col], errors='coerce')

if 'discount_percentage' in products.columns:
    products['discount_percentage'] = (
        products['discount_percentage'].astype(str).str.replace('%', '', regex=False)
    )
    products['discount_percentage'] = pd.to_numeric(products['discount_percentage'], errors='coerce')

# rating & rating_count
if 'rating' in products.columns:
    products['rating'] = pd.to_numeric(products['rating'], errors='coerce')
if 'rating_count' in products.columns:
    products['rating_count'] = (
        products['rating_count'].astype(str)
        .str.replace(',', '', regex=False)
        .str.replace(r'[^0-9]', '', regex=True)
    )
    products['rating_count'] = pd.to_numeric(products['rating_count'], errors='coerce').fillna(0).astype(int)

# Normalize image links (markdown to direct URL)
if 'img_link' in products.columns:
    products['img_link'] = products['img_link'].map(_normalize_img_link)

# ---------- Category path parsing ----------
# Example: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables"
products['category'] = products['category'].astype(str).fillna('')
products['category_path'] = products['category'].apply(lambda s: [seg for seg in str(s).split('|') if seg])
products['category_leaf'] = products['category_path'].apply(lambda v: v[-1] if len(v) else None)
products['category_top']  = products['category_path'].apply(lambda v: v[0] if len(v) else None)

print(f"Loaded {len(products)} products")

# Build a fast lookup from product_id -> row
_products_by_id = products.set_index('product_id', drop=False)

# ============================================================
# LOAD MODEL ARTIFACTS (HYBRID)
# ============================================================
ART = None
MODEL_LOADED = False
POP_RANK = None  # list of product_ids by training popularity

try:
    print(f"Loading model artifacts from: {MODEL_FILE}")
    ART = load(MODEL_FILE)
    MODEL_LOADED = True
    POP_RANK = ART.get('pop_rank', [])
    print("✓ Model artifacts loaded")
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            print('Manifest:', json.load(f))
except Exception as e:
    print(f"⚠️ Could not load model artifacts: {e}")
    print("   Falling back to simple popularity/content by category")
    MODEL_LOADED = False
    POP_RANK = None

# ============================================================
# HELPERS
# ============================================================

def _intersect_pop_with_catalog(pop_list, n):
    """Return top-n products from pop_rank that exist in current catalog."""
    if not pop_list:
        # fallback: by rating_count then rating
        cols = [c for c in ['rating_count', 'rating'] if c in products.columns]
        if cols:
            return products.nlargest(n, cols)
        return products.head(n)
    found = []
    for pid in pop_list:
        if pid in _products_by_id.index:
            found.append(_products_by_id.loc[pid])
            if len(found) >= n:
                break
    if not found:
        cols = [c for c in ['rating_count', 'rating'] if c in products.columns]
        return products.nlargest(n, cols) if cols else products.head(n)
    return pd.DataFrame(found)


def get_popular_products(n=10):
    if MODEL_LOADED and POP_RANK:
        return _intersect_pop_with_catalog(POP_RANK, n)
    cols = [c for c in ['rating_count', 'rating'] if c in products.columns]
    return products.nlargest(n, cols) if cols else products.head(n)


def get_product_by_id(product_id):
    try:
        row = _products_by_id.loc[product_id]
        if isinstance(row, pd.Series):
            return row.to_dict()
        return row.iloc[0].to_dict()
    except KeyError:
        return None

# ---------- CONTENT-BASED using TF‑IDF from model ----------

def _content_recommend_model(seed_pid: str, top_k: int) -> list:
    pid2idx = ART.get('content_pid2idx')
    idx2pid = ART.get('content_idx2pid')
    sim = ART.get('content_similarity')
    if pid2idx is None or idx2pid is None or sim is None:
        return []
    if seed_pid not in pid2idx:
        return []
    idx = pid2idx[seed_pid]
    scores = list(enumerate(sim[idx]))
    scores.sort(key=lambda x: x[1], reverse=True)
    # skip self
    rec_ids = [idx2pid[i] for i, _ in scores[1: top_k + 1] if idx2pid[i] in _products_by_id.index]
    return rec_ids


def get_content_based_recommendations(product_id, n=10):
    if MODEL_LOADED:
        ids = _content_recommend_model(product_id, n)
        if ids:
            df_res = _products_by_id.loc[ids]
            if isinstance(df_res, pd.Series):
                df_res = df_res.to_frame().T
            return df_res
        # fallthrough to fallback if empty
    # Fallback: same category_leaf (more precise than whole path string)
    product = get_product_by_id(product_id)
    if product:
        leaf = product.get('category_leaf') or product.get('category')
        similar = products[(products['product_id'] != product_id) & (
            products['category_leaf'].astype(str).str.lower() == str(leaf).lower()
        )]
        cols = [c for c in ['rating_count', 'rating'] if c in products.columns]
        if cols:
            similar = similar.nlargest(n, cols)
        return similar.head(n)
    return get_popular_products(n)

# ---------- Collaborative / Hybrid ----------

def _collab_scores_for_user_idx(uidx: int) -> np.ndarray:
    U = ART.get('U'); V = ART.get('V')
    if U is None or V is None:
        return None
    return U[uidx] @ V.T


def _collab_recommend(user_id: str, top_k: int, mask_viewed: bool = True) -> list:
    ue = ART.get('user_encoder'); pe = ART.get('product_encoder')
    if ue is None or pe is None:
        return []
    if user_id not in ue.classes_:
        return []
    uidx = ue.transform([user_id])[0]
    scores = _collab_scores_for_user_idx(uidx)
    if scores is None:
        return []
    scores = scores.copy()
    if mask_viewed:
        viewed = set(session.get('viewed_products', []))
        # mask viewed items by their encoded indices
        mask_idx = []
        for i in range(len(scores)):
            try:
                pid = pe.inverse_transform([i])[0]
                if pid in viewed:
                    mask_idx.append(i)
            except Exception:
                continue
        if mask_idx:
            scores[np.array(mask_idx)] = -np.inf
    best = np.argsort(scores)[::-1]
    rec_ids = []
    for idx in best:
        try:
            pid = pe.inverse_transform([idx])[0]
        except Exception:
            continue
        if pid in _products_by_id.index:
            rec_ids.append(pid)
        if len(rec_ids) >= top_k:
            break
    return rec_ids


def _hybrid_recommend(user_id: str, top_k: int = 10, alpha: float = 0.55, seed_pid: str = None) -> list:
    collab_list = _collab_recommend(user_id, top_k=max(50, top_k)) if MODEL_LOADED else []
    content_scores = {}
    if seed_pid:
        for p in _content_recommend_model(seed_pid, top_k=50):
            content_scores[p] = content_scores.get(p, 0.0) + 1.0
    if content_scores:
        mx = max(content_scores.values())
        for k in list(content_scores.keys()):
            content_scores[k] /= mx
    hybrid = {}
    for i, p in enumerate(collab_list):
        hybrid[p] = hybrid.get(p, 0.0) + alpha * (1.0 / (i + 1))
    for p, s in content_scores.items():
        hybrid[p] = hybrid.get(p, 0.0) + (1.0 - alpha) * s
    if not hybrid:
        return _intersect_pop_with_catalog(POP_RANK, top_k)['product_id'].tolist() if POP_RANK else get_popular_products(top_k)['product_id'].tolist()
    viewed = set(session.get('viewed_products', []))
    out = [p for p,_ in sorted(hybrid.items(), key=lambda x: x[1], reverse=True) if p not in viewed]
    return out[:top_k]

# ---------- Search / Filter aware of category_path ----------

def _matches_category_path(series: pd.Series, keyword: str) -> pd.Series:
    kw = str(keyword).strip().lower()
    return series.apply(lambda path: any(kw in seg.lower() for seg in (path or [])))

# ============================================================
# FALLBACK HTML (if templates missing)
# ============================================================
INDEX_FALLBACK = """
<!doctype html><html><head><meta charset="utf-8"><title>Home</title></head>
<body>
  <h1>Featured Products</h1>
  <ul>
  {% for p in products %}
    <li><a href="/product/{{p['product_id']}}">{{p['product_name']}}</a> — {{p.get('category_leaf') or p.get('category')}} — ⭐ {{p.get('rating')}}</li>
  {% endfor %}
  </ul>
</body></html>
"""

PRODUCT_FALLBACK = """
<!doctype html><html><head><meta charset="utf-8"><title>{{product['product_name']}}</title></head>
<body>
  <a href="/">⬅ Back</a>
  <h1>{{product['product_name']}}</h1>
  <p>Category: {{product.get('category')}}</p>
  <p>Leaf: {{product.get('category_leaf')}}</p>
  <p>Price: ₹{{product.get('discounted_price')}} (MRP ₹{{product.get('actual_price')}} | -{{product.get('discount_percentage')}}%)</p>
  <p>Rating: {{product.get('rating')}} ({{product.get('rating_count')}})</p>
  {% if product.get('img_link') %}<img src="{{product['img_link']}}" alt="image" width="240" />{% endif %}
  <h2>Recommendations</h2>
  <ul>
  {% for r in recommendations %}
    <li><a href="/product/{{r['product_id']}}">{{r['product_name']}}</a> — {{r.get('category_leaf')}}</li>
  {% endfor %}
  </ul>
</body></html>
"""

RECS_FALLBACK = """
<!doctype html><html><head><meta charset="utf-8"><title>Recommendations</title></head>
<body>
  <a href="/">⬅ Back</a>
  <h1>{{message}}</h1>
  <ul>
  {% for p in products %}
    <li><a href="/product/{{p['product_id']}}">{{p['product_name']}}</a></li>
  {% endfor %}
  </ul>
</body></html>
"""


def render_template_safe(name: str, fallback_html: str, **context):
    try:
        return render_template(name, **context)
    except TemplateNotFound:
        return render_template_string(fallback_html, **context)

# ============================================================
# ROUTES
# ============================================================
@app.route('/')
def index():
    featured = get_popular_products(12)
    # Expose leaf categories for UI dropdowns
    categories = sorted([c for c in products['category_leaf'].dropna().unique()])
    return render_template_safe('index.html', INDEX_FALLBACK,
                                products=featured.to_dict('records'),
                                categories=categories)

@app.route('/product/<product_id>')
def product_detail(product_id):
    product = get_product_by_id(product_id)
    if not product:
        return "Product not found", 404
    # Track session history
    viewed = session.get('viewed_products', [])
    if product_id not in viewed:
        viewed.append(product_id)
        session['viewed_products'] = viewed
        session.modified = True
    # Recommendations
    recommendations = get_content_based_recommendations(product_id, n=6)
    return render_template_safe('product.html', PRODUCT_FALLBACK,
                                product=product,
                                recommendations=recommendations.to_dict('records'))

@app.route('/recommendations')
def recommendations_page():
    viewed = session.get('viewed_products', [])
    if len(viewed) == 0:
        recs = get_popular_products(20)
        message = "Popular Products (View products to get personalized recommendations)"
    else:
        last_viewed = viewed[-1]
        rec_ids = _hybrid_recommend(user_id='__anonymous__', top_k=20, alpha=0.55, seed_pid=last_viewed) if MODEL_LOADED else None
        if rec_ids:
            recs = _products_by_id.loc[rec_ids]
            if isinstance(recs, pd.Series):
                recs = recs.to_frame().T
            message = "Because you viewed similar products"
        else:
            recs = get_content_based_recommendations(last_viewed, n=20)
            message = "Because you viewed similar products"
    return render_template_safe('recommendations.html', RECS_FALLBACK,
                                products=recs.to_dict('records'), message=message)

# ---------- APIs ----------
@app.route('/api/search')
def api_search():
    q = request.args.get('q', '').strip().lower()
    if not q:
        return jsonify({'products': [], 'count': 0})
    mask = (
        products['product_name'].astype(str).str.lower().str.contains(q, na=False) |
        _matches_category_path(products['category_path'], q)
    )
    res = products[mask]
    return jsonify({'products': res.head(20).to_dict('records'), 'count': int(len(res))})

@app.route('/api/filter')
def api_filter():
    category = request.args.get('category')  # can be any segment
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    min_rating = request.args.get('min_rating')

    filtered = products.copy()
    if category:
        filtered = filtered[_matches_category_path(filtered['category_path'], category)]
    if min_price:
        filtered = filtered[filtered['discounted_price'] >= float(min_price)]
    if max_price:
        filtered = filtered[filtered['discounted_price'] <= float(max_price)]
    if min_rating:
        filtered = filtered[filtered['rating'] >= float(min_rating)]

    return jsonify({'products': filtered.to_dict('records'), 'count': int(len(filtered))})

@app.route('/api/recommendations/<product_id>')
def api_recommendations(product_id):
    recs = get_content_based_recommendations(product_id, n=10)
    return jsonify({'recommendations': recs.to_dict('records'), 'model_loaded': MODEL_LOADED})

@app.route('/api/user_recommendations')
def api_user_recommendations():
    user_id = request.args.get('user_id', '').strip()
    top_k = int(request.args.get('top_k', 10))
    alpha = float(request.args.get('alpha', 0.55))
    seed_pid = request.args.get('seed_product_id')

    if not MODEL_LOADED:
        recs = get_popular_products(top_k)
        return jsonify({'user_id': user_id, 'model_loaded': False, 'recommendations': recs.to_dict('records')})
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    ue = ART.get('user_encoder')
    if ue is None or user_id not in ue.classes_:
        recs = get_popular_products(top_k)
        return jsonify({'user_id': user_id, 'cold_start': True, 'recommendations': recs.to_dict('records')})

    pid_list = _hybrid_recommend(user_id=user_id, top_k=top_k, alpha=alpha, seed_pid=seed_pid)
    if not pid_list:
        recs = get_popular_products(top_k)
        return jsonify({'user_id': user_id, 'fallback': 'popularity', 'recommendations': recs.to_dict('records')})

    df_res = _products_by_id.loc[pid_list]
    if isinstance(df_res, pd.Series):
        df_res = df_res.to_frame().T
    return jsonify({'user_id': user_id, 'model_loaded': True, 'recommendations': df_res.to_dict('records')})

@app.route('/api/product/<product_id>')
def api_product(product_id):
    p = get_product_by_id(product_id)
    if not p:
        return jsonify({'error': 'not found'}), 404
    return jsonify(p)

@app.route('/api/stats')
def api_stats():
    stats = {
        'total_products': int(len(products)),
        'categories_leaf': int(products['category_leaf'].nunique()),
        'categories_top': int(products['category_top'].nunique()),
        'avg_rating': float(products['rating'].mean()) if 'rating' in products.columns else None,
        'avg_price': float(products['discounted_price'].mean()) if 'discounted_price' in products.columns else None,
        'viewed_count': int(len(session.get('viewed_products', []))),
        'model_loaded': MODEL_LOADED,
        'model_dir': MODEL_DIR
    }
    return jsonify(stats)

# ============================================================
# RUN APP
# ============================================================
if __name__ == '__main__':
    print("\n" + "="*70)
    print("PRODUCT RECOMMENDATION SYSTEM — Flask v2.1")
    print("="*70)
    print(f"\n✓ Products loaded: {len(products)}")
    print(f"✓ Categories (leaf/top): {products['category_leaf'].nunique()} / {products['category_top'].nunique()}")
    price_min = products['discounted_price'].min() if 'discounted_price' in products.columns else None
    price_max = products['discounted_price'].max() if 'discounted_price' in products.columns else None
    print(f"✓ Price range: ₹{price_min:.0f} - ₹{price_max:.0f}" if price_min is not None else "✓ Price range: N/A")
    print(f"✓ Avg rating: {products['rating'].mean():.2f}" if 'rating' in products.columns else "✓ Avg rating: N/A")
    print(f"✓ Model loaded: {MODEL_LOADED} (from {MODEL_DIR})")
    print("\nStarting server at http://localhost:5000")
    print("="*70)

    app.run(debug=True, port=5000)
