document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. Top-Bar Close Functionality
    // -----------------------------------------------------------------
    const topBar = document.getElementById('top-bar');
    const closeTopBarBtn = document.getElementById('close-topbar-btn');
    if (topBar && closeTopBarBtn) {
        closeTopBarBtn.addEventListener('click', () => {
            topBar.classList.add('hidden');
        });
    }

    // -----------------------------------------------------------------
    // 2. Real-Time Product Search Filtering
    // -----------------------------------------------------------------
    const searchInput = document.getElementById('search-input');
    const productCards = document.querySelectorAll('.product-card');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            productCards.forEach(card => {
                const productName = card.dataset.name.toLowerCase();
                if (productName.includes(query)) {
                    card.classList.remove('hidden-product');
                } else {
                    card.classList.add('hidden-product');
                }
            });
        });
    }

    // -----------------------------------------------------------------
    // 3. Customer Testimonials smooth slider
    // -----------------------------------------------------------------
    const customerBox = document.getElementById('customer-box');
    const prevBtn = document.getElementById('prev-customer-btn');
    const nextBtn = document.getElementById('next-customer-btn');
    if (customerBox && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            customerBox.scrollBy({ left: -370, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            customerBox.scrollBy({ left: 370, behavior: 'smooth' });
        });
    }

    // -----------------------------------------------------------------
    // 4. Newsletter Subscription Validation and Alert
    // -----------------------------------------------------------------
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterBtn = document.getElementById('newsletter-btn');
    if (newsletterBtn && newsletterEmail) {
        newsletterBtn.addEventListener('click', () => {
            const emailValue = newsletterEmail.value.trim();
            if (!emailValue) {
                showToast('Please enter your email address.', 'info');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                showToast('Please enter a valid email address.', 'info');
                return;
            }
            showToast('Thank you! Successfully subscribed to newsletter. 🎉', 'success');
            newsletterEmail.value = '';
        });
    }

    // -----------------------------------------------------------------
    // 5. Toast Notifications Helper
    // -----------------------------------------------------------------
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : 'ℹ';
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        // Trigger reflow for slide-in animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // -----------------------------------------------------------------
    // 6. Interactive Shopping Cart Management
    // -----------------------------------------------------------------
    let cart = JSON.parse(localStorage.getItem('shop_co_cart')) || [];

    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartBadge = document.getElementById('cart-badge');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const startShoppingBtn = document.getElementById('start-shopping-btn');

    function openCart() {
        cartDrawer.classList.add('open');
        cartBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
    if (startShoppingBtn) startShoppingBtn.addEventListener('click', closeCart);

    function updateCartUI() {
        localStorage.setItem('shop_co_cart', JSON.stringify(cart));
        
        // Count totals
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
        
        // Empty state toggling
        if (cart.length === 0) {
            cartEmptyMessage.style.display = 'flex';
            cartItemsContainer.style.display = 'none';
        } else {
            cartEmptyMessage.style.display = 'none';
            cartItemsContainer.style.display = 'flex';
        }
        
        // Render items list
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn" data-id="${item.id}" data-action="decrease">&minus;</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-id="${item.id}" data-action="increase">&plus;</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: 1
            });
        }
        updateCartUI();
        showToast(`Added "${product.name}" to cart! 🛍️`, 'success');
        setTimeout(openCart, 300);
    }

    // Delegated click listeners inside cart container to avoid inline event risks
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('qty-btn')) {
                const id = target.dataset.id;
                const action = target.dataset.action;
                const item = cart.find(item => item.id === id);
                if (item) {
                    if (action === 'increase') {
                        item.quantity += 1;
                    } else if (action === 'decrease') {
                        item.quantity -= 1;
                        if (item.quantity <= 0) {
                            cart = cart.filter(item => item.id !== id);
                        }
                    }
                    updateCartUI();
                }
            } else if (target.classList.contains('remove-item-btn')) {
                const id = target.dataset.id;
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
                showToast('Item removed from cart.', 'info');
            }
        });
    }

    // Attach Add to Cart event listeners to product cards
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const product = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: card.dataset.price,
                    image: card.dataset.image
                };
                addToCart(product);
            }
        });
    });

    // Checkout Simulation
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            showToast('Checking out... Thank you for shopping with us! 💳🎉', 'success');
            cart = [];
            updateCartUI();
            setTimeout(closeCart, 1500);
        });
    }

    // Initial rende
});
