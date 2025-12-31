const jsonProducts = `[
    {"id":1, "name":"سماعة رأس لاسلكية", "price":2500, "category":"electronics", "img":"images/headphone.jpg"},
    {"id":2, "name":"ساعة ذكية برو", "price":4500, "category":"watches", "img":"images/whitewatch.jpg"},
    {"id":3, "name":"حذاء رياضي مريح", "price":1990, "category":"shoes", "img":"images/shoes.jpg"},
    {"id":4, "name":"كاميرا احترافية", "price":32000, "category":"electronics", "img":"images/canyoncamera.jpg"},
    {"id":5, "name":"نظارة شمسية كلاسيك", "price":1200, "category":"fashion", "img":"images/sunglasses.jpg"},
    {"id":6, "name":"تيشيرت قطني", "price":850, "category":"fashion", "img":"images/cottont-shirt.jpg"},
    {"id":7, "name":"ساعة كلاسيكية", "price":8000, "category":"watches", "img":"images/classicwatch.jpg"},
    {"id":8, "name":"لابتوب للأعمال", "price":45000, "category":"electronics", "img":"images/laptop.jpg"}
]`;

let products = JSON.parse(jsonProducts);
let cart = JSON.parse(localStorage.getItem('myStoreCart')) || [];

window.onload = function() {
    updateCartCount();

    if(document.getElementById('featured-products')) {
        renderFeatured();
    }

    if(document.getElementById('products-grid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('cat') || 'all';
        filterProducts(cat);
        setupSearch();
    }

    if(document.getElementById('cart-items')) {
        renderCart();
    }
};

function setupSearch() {
    const input = document.getElementById('search-input');
    if(!input) return;
    
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(term));
        renderProducts(filtered);
    });
}

function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    
    if(list.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280; font-weight: 700;">لا توجد منتجات مطابقة لبحثك</div>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="product-card">
            <div class="product-img">
                <img src="${p.img}">
            </div>
            <span class="badge">${p.category}</span>
            <h3 class="product-title">${p.name}</h3>
            <div class="product-footer">
                <span class="price">${p.price} ج.م</span>
                <button onclick="addToCart(${p.id})" class="btn-icon">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFeatured() {
    const featured = products.slice(0, 4);
    const container = document.getElementById('featured-products');
    if(!container) return;
    container.innerHTML = featured.map(p => `
        <a href="products.html" class="product-card" style="display: block; color: inherit;">
            <div class="product-img" style="height: 10rem;">
                <img src="${p.img}">
            </div>
            <h4 style="font-weight: 700;">${p.name}</h4>
            <p class="price" style="font-size: 1rem;">${p.price} ج.م</p>
        </a>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({...product, qty: 1});
    }
    saveCart();
    showToast('تمت الإضافة للسلة');
}

function saveCart() {
    localStorage.setItem('myStoreCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if(!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: #6b7280;">السلة فارغة حالياً</div>';
        document.getElementById('cart-total').innerText = '0 ج.م';
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
        <div class="cart-item">
            <div class="cart-item-info">
                <img src="${item.img}" class="cart-item-img">
                <div>
                    <h4 style="font-weight: 700;">${item.name}</h4>
                    <p style="font-size: 0.875rem; color: #6b7280;">${item.price} ج.م</p>
                </div>
            </div>
            <div class="cart-item-info">
                <div class="qty-control">
                    <button onclick="updateQty(${item.id}, -1)" class="qty-btn">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button onclick="updateQty(${item.id}, 1)" class="qty-btn">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = total + ' ج.م';
}

function updateQty(id, change) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
        saveCart();
        renderCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    renderCart();
}

function filterProducts(cat) {
    const input = document.getElementById('search-input');
    if(input) input.value = '';

    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active-filter');
        if(b.dataset.cat === cat) {
            b.classList.add('active-filter');
        }
    });

    if (cat === 'all') renderProducts(products);
    else renderProducts(products.filter(p => p.category === cat));
    
    if(window.location.pathname.includes('products.html')) {
        const url = new URL(window.location);
        url.searchParams.set('cat', cat);
        window.history.pushState({}, '', url);
    }
}

function checkout() {
    if(cart.length === 0) return alert('السلة فارغة!');
    alert('شكراً لتسوقك! سيتم التواصل معك قريباً.');
    cart = [];
    saveCart();
    window.location.href = 'index.html';
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fade-in';
    toast.style.position = 'fixed';
    toast.style.bottom = '1rem';
    toast.style.left = '1rem';
    toast.style.backgroundColor = '#1f2937';
    toast.style.color = 'white';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = '0.25rem';
    toast.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}