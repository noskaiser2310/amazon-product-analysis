// Main JavaScript for Product Recommendation System

function searchProducts() {
    const query = document.getElementById('searchInput').value;
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    $.ajax({
        url: '/api/search',
        data: { q: query },
        success: function(data) {
            displayProducts(data.products);
            $('#productCount').text(data.count + ' products found');
        }
    });
}

function applyFilters() {
    const category = $('#categoryFilter').val();
    const minPrice = $('#minPrice').val();
    const maxPrice = $('#maxPrice').val();
    const minRating = $('#ratingFilter').val();
    
    $.ajax({
        url: '/api/filter',
        data: {
            category: category,
            min_price: minPrice,
            max_price: maxPrice,
            min_rating: minRating
        },
        success: function(data) {
            displayProducts(data.products);
            $('#productCount').text(data.count + ' products');
        }
    });
}

function clearFilters() {
    $('#categoryFilter').val('');
    $('#minPrice').val('');
    $('#maxPrice').val('');
    $('#ratingFilter').val('');
    location.reload();
}

function displayProducts(products) {
    const grid = $('#productGrid');
    grid.empty();
    
    if (products.length === 0) {
        $('#noResults').show();
        return;
    }
    
    $('#noResults').hide();
    
    products.forEach(product => {
        const card = `
            <div class="col fade-in">
                <div class="card h-100 product-card">
                    <img src="${product.img_link}" class="card-img-top" alt="${product.product_name}">
                    <div class="card-body">
                        <h6 class="card-title">${product.product_name.substring(0, 60)}...</h6>
                        <p class="text-muted mb-2"><small>${product.category.substring(0, 40)}</small></p>
                        
                        <div class="mb-2">
                            <span class="badge bg-success">
                                <i class="fas fa-star"></i> ${product.rating.toFixed(1)}
                            </span>
                            <small class="text-muted">(${product.rating_count} reviews)</small>
                        </div>
                        
                        <div class="mb-3">
                            <h5 class="text-primary mb-0">₹${Math.round(product.discounted_price)}</h5>
                            <small class="text-muted text-decoration-line-through">₹${Math.round(product.actual_price)}</small>
                            <span class="badge bg-danger">${Math.round(product.discount_percentage)}% OFF</span>
                        </div>
                        
                        <a href="/product/${product.product_id}" class="btn btn-primary btn-sm w-100">
                            <i class="fas fa-eye"></i> View Details
                        </a>
                    </div>
                </div>
            </div>
        `;
        grid.append(card);
    });
}

function loadStats() {
    $.ajax({
        url: '/api/stats',
        success: function(data) {
            const stats = `
                <p class="mb-1"><small><i class="fas fa-box"></i> ${data.total_products} products</small></p>
                <p class="mb-1"><small><i class="fas fa-tags"></i> ${data.categories} categories</small></p>
                <p class="mb-1"><small><i class="fas fa-star"></i> Avg: ${data.avg_rating.toFixed(2)}</small></p>
                <p class="mb-0"><small><i class="fas fa-eye"></i> Viewed: ${data.viewed_count}</small></p>
            `;
            $('#statsContainer').html(stats);
        }
    });
}

$(document).ready(function() {
    $('#searchInput').keypress(function(e) {
        if (e.which === 13) searchProducts();
    });
});
