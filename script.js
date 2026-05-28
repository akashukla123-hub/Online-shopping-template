// ShopLittle JavaScript

// Default products jo hamesha dikhenge
const defaultProducts = [
    {
        id: 1,
        name: "boAt Rockerz 450 Bluetooth Headphone",
        price: 1499,
        img: "https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg",
        category: "Electronics",
        stock: 50,
        delivery: "FREE Delivery by Tomorrow"
    },
    {
        id: 2,
        name: "Samsung Galaxy M14 5G",
        price: 13999,
        img: "https://m.media-amazon.com/images/I/81pmO0iVNhL._SL1500_.jpg",
        category: "Mobiles",
        stock: 20,
        delivery: "FREE Delivery by Tomorrow"
    }
];

// 1. CART DATA
let cart = JSON.parse(localStorage.getItem('shoplittle_cart')) || [];

function updateCartCount() {
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartLinks.forEach(link => {
        link.innerHTML = `Cart 🛒 (${totalQty})`;
    });
}

// 2. ADD TO CART
function addToCart(name, price, img, stock, delivery) {
    price = typeof price === 'string'? parseInt(price.replace(/[^0-9]/g, '')) : price;
    stock = stock || 999;
    delivery = delivery || "In Stock";

    if (stock === 0 || delivery === 'Out of Stock') {
        alert('Sorry, this product is out of stock!');
        return;
    }

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        if (existingItem.qty >= stock) {
            alert(`Only ${stock} items available in stock!`);
            return;
        }
        existingItem.qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1, stock });
    }

    localStorage.setItem('shoplittle_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

// 3. LOAD CART
function loadCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart" style="padding: 40px; text-align: center;">
                <h2>Your ShopLittle Cart is empty</h2>
                <a href="shoplittle.html" style="color:#007185; display: inline-block; margin-top: 15px;">Shop today's deals</a>
            </div>
        `;
        updateCheckoutBox();
        return;
    }

    let cartHTML = '';
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="stock" style="color: #067D62;">In stock</p>
                    <p>Eligible for FREE Shipping</p>
                    <div class="item-actions">
                        <select class="qty-select" onchange="updateQty(${index}, this.value)">
                            ${[1,2,3,4,5,6,7,8,9,10].map(n =>
                                `<option value="${n}" ${item.qty === n? 'selected' : ''}>Qty: ${n}</option>`
                            ).join('')}
                        </select>
                        <a href="#" onclick="deleteItem(${index}); return false;">Delete</a>
                    </div>
                <div class="price">₹${(item.price * item.qty).toLocaleString()}</div>
            </div>
        `;
    });

    cartItemsList.innerHTML = cartHTML;
    updateCheckoutBox();
}

function updateCheckoutBox() {
    const checkoutBox = document.querySelector('.subtotal-price');
    if (!checkoutBox) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    checkoutBox.innerHTML = `Subtotal (${totalQty} items): <b>₹${total.toLocaleString()}</b>`;
}

// 4. UPDATE QTY
function updateQty(index, qty) {
    const newQty = parseInt(qty);
    const adminProducts = JSON.parse(localStorage.getItem('shoplittle_products')) || [];
    const allProducts = [...defaultProducts,...adminProducts];
    const product = allProducts.find(p => p.name === cart[index].name);

    if (product && newQty > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        loadCart();
        return;
    }

    cart[index].qty = newQty;
    localStorage.setItem('shoplittle_cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// 5. DELETE ITEM
function deleteItem(index) {
    if (confirm('Remove this item from cart?')) {
        cart.splice(index, 1);
        localStorage.setItem('shoplittle_cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

// 6. SEARCH
function searchProducts() {
    const input = document.querySelector('.search-box input');
    const query = input.value.toLowerCase().trim();
    if (query) {
        const productsContainer = document.getElementById('productsContainer');
        if (productsContainer) filterProducts(query);
    }
}

function filterProducts(query) {
    const adminProducts = JSON.parse(localStorage.getItem('shoplittle_products')) || [];
    const allProducts = [...defaultProducts,...adminProducts];
    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    displayProductsList(filtered);
}

// 7. CHECKOUT
function proceedToBuy() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const loggedInUser = localStorage.getItem('shoplittle_logged_in');
    if (!loggedInUser) {
        alert('Please sign in to checkout');
        window.location.href = 'signin.html';
        return;
    }

    let adminProducts = JSON.parse(localStorage.getItem('shoplittle_products')) || [];

    for (let cartItem of cart) {
        const defaultProd = defaultProducts.find(p => p.name === cartItem.name);
        const adminProd = adminProducts.find(p => p.name === cartItem.name);
        const product = adminProd || defaultProd;

        if (product && product.stock < cartItem.qty) {
            alert(`Sorry, ${cartItem.name} is out of stock!`);
            return;
        }
    }

    let orders = JSON.parse(localStorage.getItem('shoplittle_orders')) || [];
    const newOrder = {
        id: Date.now(),
        customer: loggedInUser,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Pending'
    };

    orders.push(newOrder);
    localStorage.setItem('shoplittle_orders', JSON.stringify(orders));

    cart.forEach(cartItem => {
        const productIndex = adminProducts.findIndex(p => p.name === cartItem.name);
        if (productIndex!== -1) {
            adminProducts[productIndex].stock = Math.max(0, adminProducts[productIndex].stock - cartItem.qty);
            if (adminProducts[productIndex].stock === 0) {
                adminProducts[productIndex].delivery = 'Out of Stock';
            }
        }
    });
    localStorage.setItem('shoplittle_products', JSON.stringify(adminProducts));

    alert('Order placed successfully! Order ID: #' + newOrder.id);
    cart = [];
    localStorage.setItem('shoplittle_cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
}

// 8. USER NAME
function showUserName() {
    const userBox = document.getElementById('userAccount');
    if (!userBox) return;

    const loggedInUser = localStorage.getItem('shoplittle_logged_in');

    if (loggedInUser) {
        const users = JSON.parse(localStorage.getItem('shoplittle_users')) || [];
        const currentUser = users.find(u => u.name === loggedInUser);
        const userEmail = currentUser? currentUser.mobile : '';

        userBox.classList.add('account-menu');
        userBox.innerHTML = `
            <a href="#">Hello, ${loggedInUser} ▼</a>
            <div class="account-dropdown">
                <div class="account-dropdown-header">
                    <b>${loggedInUser}</b><br>
                    <span>${userEmail}</span>
                </div>
                <a href="orders.html">Your Orders</a>
                ${loggedInUser === 'Admin'? '<a href="admin.html">Admin Panel</a>' : ''}
                <a href="#">Your Account</a>
                <a href="#">Customer Service</a>
                <a href="#" class="signout-link" onclick="logout(); return false;">Sign out</a>
            </div>
        `;
    } else {
        userBox.classList.remove('account-menu');
        userBox.innerHTML = `<a href="signin.html">Hello, Sign in</a>`;
    }
}

function logout() {
    localStorage.removeItem('shoplittle_logged_in');
    alert('Signed out successfully');
    window.location.href = 'shoplittle.html';
}

// 9. LOAD HOME PRODUCTS
function loadHomeProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    const adminProducts = JSON.parse(localStorage.getItem('shoplittle_products')) || [];
    const allProducts = [...defaultProducts,...adminProducts];
    displayProductsList(allProducts);
}

// 10. DISPLAY PRODUCTS - SINGLE VERSION
function displayProductsList(products) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><h2>No products found</h2></div>`;
        return;
    }

    let html = '';
    products.forEach((product) => {
        const safeName = product.name.replace(/'/g, "\\'");
        const safeImg = product.img.replace(/'/g, "\\'");
        const safeDelivery = (product.delivery || 'In Stock').replace(/'/g, "\\'");
        const stock = product.stock || 999;
        const productId = product.id;

        let stockBadge = '';
        let btnDisabled = '';

        if (stock === 0 || product.delivery === 'Out of Stock') {
            stockBadge = '<p style="color: #D00; font-size: 13px; font-weight: bold; margin: 5px 0;">❌ Out of Stock</p>';
            btnDisabled = 'disabled style="background: #ccc; cursor: not-allowed;"';
        } else if (stock <= 5) {
            stockBadge = `<p style="color: #F90; font-size: 13px; font-weight: bold; margin: 5px 0;">⚠️ Only ${stock} left</p>`;
        }

        html += `
            <div class="product-card" onclick="showProductDetail(${productId})" style="cursor:pointer;">
                <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toLocaleString()}</p>
                <p class="category">${product.category}</p>
                ${stockBadge}
                <button class="add-btn" onclick="event.stopPropagation(); addToCart('${safeName}', ${product.price}, '${safeImg}', ${stock}, '${safeDelivery}')" ${btnDisabled}>
                    ${stock === 0 || product.delivery === 'Out of Stock'? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
    });

    productsContainer.innerHTML = html;
}

// 11. PRODUCT DETAIL MODAL
function showProductDetail(productId) {
    const adminProducts = JSON.parse(localStorage.getItem('shoplittle_products')) || [];
    const allProducts = [...defaultProducts,...adminProducts];
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    document.getElementById('modalImg').src = product.img;
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalPrice').textContent = `₹${product.price.toLocaleString()}`;
    document.getElementById('modalCategory').textContent = `Category: ${product.category}`;
    document.getElementById('modalStock').textContent = product.stock > 0? `In Stock: ${product.stock} units` : 'Out of Stock';
    document.getElementById('modalDelivery').textContent = product.delivery || 'FREE Delivery';

    const addBtn = document.getElementById('modalAddBtn');
    if (product.stock === 0 || product.delivery === 'Out of Stock') {
        addBtn.disabled = true;
        addBtn.textContent = 'Out of Stock';
        addBtn.style.background = '#ccc';
        addBtn.style.cursor = 'not-allowed';
    } else {
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Cart';
        addBtn.style.background = '#FFD814';
        addBtn.style.cursor = 'pointer';
        addBtn.onclick = function() {
            addToCart(product.name, product.price, product.img, product.stock, product.delivery);
            closeModal();
        };
    }

    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) closeModal();
}

// RUN ON PAGE LOAD
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadCart();
    showUserName();
    loadHomeProducts();

    const searchBtn = document.querySelector('.search-box button');
    if (searchBtn) searchBtn.onclick = searchProducts;

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) checkoutBtn.onclick = proceedToBuy;

    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchProducts();
        });
    }
});