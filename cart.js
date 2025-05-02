/* ========== Cart Modal =========== */
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.createElement('div');
cartModal.className = 'cart-modal';
document.body.appendChild(cartModal);

// Toggle cart modal
cartIcon.addEventListener('click', () => {
  cartModal.classList.toggle('show');
  renderCart();
});

// Close cart when clicking outside
document.addEventListener('click', (e) => {
  if (!cartModal.contains(e.target) && e.target !== cartIcon && !cartIcon.contains(e.target)) {
    cartModal.classList.remove('show');
  }
});

/* ========== Helper: Calculate Total =========== */
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
}

/* ========== Render Cart Modal =========== */
function renderCart() {
  if (cart.length === 0) {
    cartModal.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="#" class="btn">Continue Shopping</a>
      </div>
    `;
  } else {
    cartModal.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart (${cart.reduce((total, item) => total + item.quantity, 0)})</h3>
        <button class="close-cart"><i class="bx bx-x"></i></button>
      </div>
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.url}" alt="${item.title}">
            <div class="item-details">
              <h4>${item.title}</h4>
              <div class="item-price">
                Rs.${item.price} × ${item.quantity} = <strong>Rs.${(item.price * item.quantity).toFixed(2)}</strong>
              </div>
              <div class="item-quantity">
                <button class="quantity-btn minus">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus">+</button>
              </div>
            </div>
            <button class="remove-item"><i class="bx bx-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <div class="cart-total">
        <span>Total:</span>
        <span>Rs.${calculateCartTotal()}</span>
      </div>
      <button class="btn checkout-btn">Proceed to Checkout</button>
    `;

    // Handle quantity decrease
    cartModal.querySelectorAll('.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        const item = cart.find(item => item.id === itemId);
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          cart = cart.filter(cartItem => cartItem.id !== itemId);
        }
        saveCartToLocalStorage();
        updateCartCount();
        renderCart();
      });
    });

    // Handle quantity increase
    cartModal.querySelectorAll('.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        const item = cart.find(item => item.id === itemId);
        item.quantity += 1;
        saveCartToLocalStorage();
        updateCartCount();
        renderCart();
      });
    });

    // Handle item removal
    cartModal.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        cart = cart.filter(item => item.id !== itemId);
        saveCartToLocalStorage();
        updateCartCount();
        renderCart();
      });
    });

    // Close cart manually
    cartModal.querySelector('.close-cart').addEventListener('click', () => {
      cartModal.classList.remove('show');
    });

    // Checkout button
    cartModal.querySelector('.checkout-btn').addEventListener('click', () => {
      alert('Proceeding to checkout!');
      // Optional: redirect to checkout page here
    });
  }
}

// Load cart from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalStorage();
});
