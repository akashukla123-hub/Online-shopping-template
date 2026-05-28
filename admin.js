// Admin Panel Logic

function checkAdmin() {
    const loggedInUser = localStorage.getItem('shoplittle_logged_in');
    if (!loggedInUser) {
        alert('Please sign in first');
        window.location.href = 'signin.html';
        return false;
    }
    if (loggedInUser!== 'Admin') {
        alert('Access Denied! Admin only. Current user: ' + loggedInUser);
        window.location.href = 'shoplittle.html';
        return false;
    }
    return true;
}

let products = JSON.parse(localStorage.getItem('shoplittle_products')) || [];
let orders = JSON.parse(localStorage.getItem('shoplittle_orders')) || [];

// Update stats - FIXED: Single function with inline styles
function updateStats() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    // Force grid style direct JS se
    statsContainer.style.display = 'grid';
    statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    statsContainer.style.gap = '15px';
    statsContainer.style.margin = '20px 0';

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0 || p.delivery === 'Out of Stock').length;

    statsContainer.innerHTML = `
        <div class="stat-box" style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="font-size: 32px; color: #0F1111; margin-bottom: 5px;">${products.length}</h3>
            <p style="font-size: 14px; color: #565959;">Total Products</p>
        </div>
        <div class="stat-box" style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="font-size: 32px; color: #0F1111; margin-bottom: 5px;">${orders.length}</h3>
            <p style="font-size: 14px; color: #565959;">Total Orders</p>
        </div>
        <div class="stat-box" style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="font-size: 32px; color: #0F1111; margin-bottom: 5px;">₹${revenue.toLocaleString()}</h3>
            <p style="font-size: 14px; color: #565959;">Total Revenue</p>
        </div>
        <div class="stat-box" style="background: ${lowStock > 0? '#FFF4E5' : 'white'}; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="font-size: 32px; color: ${lowStock > 0? '#F90' : '#0F1111'}; margin-bottom: 5px;">${lowStock}</h3>
            <p style="font-size: 14px; color: #565959;">Low Stock</p>
        </div>
        <div class="stat-box" style="background: ${outOfStock > 0? '#FFEAEC' : 'white'}; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="font-size: 32px; color: ${outOfStock > 0? '#D00' : '#0F1111'}; margin-bottom: 5px;">${outOfStock}</h3>
            <p style="font-size: 14px; color: #565959;">Out of Stock</p>
        </div>
    `;
}

// Display products list - UPDATED with stock
function displayProducts() {
    const productsList = document.getElementById('productsList');

    if (products.length === 0) {
        productsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #565959;">No products yet. Add some!</p>';
        return;
    }

    let html = '';
    products.forEach((product, index) => {
        let stockStatus = '';
        let stockColor = '#067D62';

        if (product.stock === 0 || product.delivery === 'Out of Stock') {
            stockStatus = '❌ Out of Stock';
            stockColor = '#D00';
        } else if (product.stock <= 5) {
            stockStatus = `⚠️ Low Stock: ${product.stock} left`;
            stockColor = '#F90';
        } else {
            stockStatus = `✅ In Stock: ${product.stock}`;
        }

        html += `
            <div class="product-row" style="border-left: 4px solid ${stockColor}">
                <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>₹${product.price.toLocaleString()} | ${product.category}</p>
                    <p style="color: ${stockColor}; font-weight: bold; font-size: 13px;">${stockStatus}</p>
                    <p style="font-size: 12px; color: #565959;">Delivery: ${product.delivery}</p>
                </div>
                <div class="product-actions">
                    <button class="btn" onclick="updateStock(${index})">Update Stock</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${index})">Delete</button>
                </div>
            </div>
        `;
    });

    productsList.innerHTML = html;
}

// Display orders list - UPDATED with delivery status
function displayOrders() {
    const ordersList = document.getElementById('ordersList');

    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="padding: 20px; text-align: center; color: #565959;">No orders yet.</p>';
        return;
    }

    let html = '';
    orders.slice().reverse().forEach((order, index) => {
        const actualIndex = orders.length - 1 - index;
        html += `
            <div class="order-row">
                <h4>Order #${order.id}</h4>
                <p><b>Customer:</b> ${order.customer} | <b>Total:</b> ₹${order.total.toLocaleString()} | <b>Date:</b> ${order.date}</p>
                <p><b>Items:</b> ${order.items.map(i => i.name + ' x' + i.qty).join(', ')}</p>
                <p><b>Status:</b>
                    <select onchange="updateOrderStatus(${actualIndex}, this.value)" style="padding: 4px;">
                        <option value="Pending" ${order.status === 'Pending'? 'selected' : ''}>Pending</option>
                        <option value="Shipped" ${order.status === 'Shipped'? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered'? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled'? 'selected' : ''}>Cancelled</option>
                    </select>
                </p>
            </div>
        `;
    });

    ordersList.innerHTML = html;
}

// Add product - UPDATED with stock & delivery
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const img = document.getElementById('productImg').value.trim();
    const category = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const delivery = document.getElementById('productDelivery').value;

    if (!name ||!price ||!img || stock < 0) {
        alert('Please fill all fields correctly');
        return;
    }

    if (price <= 0) {
        alert('Price must be greater than 0');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        img: img,
        category: category,
        stock: stock,
        delivery: delivery
    };

    products.push(newProduct);
    localStorage.setItem('shoplittle_products', JSON.stringify(products));

    alert('Product added successfully!');
    this.reset();
    document.getElementById('productStock').value = 10;
    displayProducts();
    updateStats();
});

// Update stock function - UPDATED
function updateStock(index) {
    const currentStock = products[index].stock || 0;
    const newStock = prompt(`Enter new stock for ${products[index].name}:`, currentStock);

    if (newStock!== null &&!isNaN(newStock) && newStock >= 0) {
        products[index].stock = parseInt(newStock);

        // Auto update delivery status
        if (products[index].stock === 0) {
            products[index].delivery = 'Out of Stock';
        } else if (products[index].delivery === 'Out of Stock') {
            products[index].delivery = 'Available';
        }

        localStorage.setItem('shoplittle_products', JSON.stringify(products));
        displayProducts();
        updateStats();
        alert('Stock updated successfully!');
    }
}

// Update order status - UPDATED with double delivery check
function updateOrderStatus(index, status) {
    const oldStatus = orders[index].status;
    orders[index].status = status;
    localStorage.setItem('shoplittle_orders', JSON.stringify(orders));

    // Stock kam karo sirf pehli baar Delivered hone pe
    if (status === 'Delivered' && oldStatus!== 'Delivered') {
        orders[index].items.forEach(orderItem => {
            const product = products.find(p => p.name === orderItem.name);
            if (product) {
                product.stock = Math.max(0, product.stock - orderItem.qty);
                if (product.stock === 0) product.delivery = 'Out of Stock';
            }
        });
        localStorage.setItem('shoplittle_products', JSON.stringify(products));
        displayProducts();
    }

    // Cancelled hone pe stock wapas add kar do
    if (status === 'Cancelled' && oldStatus === 'Delivered') {
        orders[index].items.forEach(orderItem => {
            const product = products.find(p => p.name === orderItem.name);
            if (product) {
                product.stock += orderItem.qty;
                if (product.delivery === 'Out of Stock') product.delivery = 'Available';
            }
        });
        localStorage.setItem('shoplittle_products', JSON.stringify(products));
        displayProducts();
    }

    alert('Order status updated to: ' + status);
    updateStats();
}

// Delete product
function deleteProduct(index) {
    if (confirm('Delete this product? This cannot be undone.')) {
        products.splice(index, 1);
        localStorage.setItem('shoplittle_products', JSON.stringify(products));
        displayProducts();
        updateStats();
    }
}

// Init admin page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdmin()) return;
    updateStats();
    displayProducts();
    displayOrders();
});