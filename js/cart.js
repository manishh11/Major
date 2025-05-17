/* ========== Cart Modal =========== */
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.createElement('div');
cartModal.className = 'cart-modal';
document.body.appendChild(cartModal);

// Cart array (defined once here)
let cart = [];

// Load cart from local storage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    updateCartCount();
    renderCart(); // Initial render of the cart modal
});


// Toggle cart modal
if (cartIcon && cartModal) {
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing immediately
        cartModal.classList.toggle('show');
        renderCart(); // Render cart content when opened
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartModal.contains(e.target) && e.target !== cartIcon && !cartIcon.contains(e.target)) {
            cartModal.classList.remove('show');
        }
    });

    // Prevent clicks inside the modal from closing it
    cartModal.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}


/* ========== Helper: Calculate Total =========== */
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
}

/* ========== Render Cart Modal =========== */
function renderCart() {
  if (!cartModal) return; // Ensure modal element exists

  if (cart.length === 0) {
    cartModal.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart (0)</h3>
        <button class="close-cart"><i class="bx bx-x"></i></button>
      </div>
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="#recipes" class="btn">Continue Shopping</a>
      </div>
    `;
  } else {
    const cartItemsHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.url}" alt="${item.title}">
        <div class="item-details">
          <h4>${item.title}</h4>
          <div class="item-price">Rs ${item.price}</div>
          <div class="item-quantity">
            <button class="quantity-btn minus">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus">+</button>
          </div>
        </div>
        <button class="remove-item"><i class="bx bx-trash"></i></button>
      </div>
    `).join('');

    cartModal.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart (${cart.reduce((total, item) => total + item.quantity, 0)})</h3>
        <button class="close-cart"><i class="bx bx-x"></i></button>
      </div>
      <div class="cart-items">
        ${cartItemsHTML}
      </div>
      <div class="cart-total">
        <span>Total:</span>
        <span class="total-price">Rs ${calculateCartTotal()}</span>
      </div>
      <button class="btn checkout-btn">Checkout</button>
    `;

    // Add event listeners for cart item buttons after rendering
    addCartItemEventListeners();
  }

  // Add event listener for the close button in the header
  cartModal.querySelector('.close-cart').addEventListener('click', () => {
      cartModal.classList.remove('show');
  });
}

/* ========== Add Event Listeners to Cart Items =========== */
function addCartItemEventListeners() {
    const cartItemsContainer = cartModal.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    // Handle quantity decrease and removal if quantity becomes 0
    cartItemsContainer.querySelectorAll('.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        const item = cart.find(item => item.id === itemId);
        if (item && item.quantity > 1) {
          item.quantity -= 1;
        } else if (item && item.quantity === 1) {
           // If quantity is 1, remove the item
           removeFromCart(itemId);
           return; // Exit function as renderCart will be called by removeFromCart
        }
        saveCartToLocalStorage();
        updateCartCount();
        renderCart(); // Re-render cart modal after quantity change
      });
    });

    // Handle quantity increase
    cartItemsContainer.querySelectorAll('.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += 1;
            saveCartToLocalStorage();
            updateCartCount();
            renderCart(); // Re-render cart modal after quantity change
        }
      });
    });

    // Handle item removal
    cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
        removeFromCart(itemId); // Call the removeFromCart function
      });
    });

    // Checkout button (if it exists after rendering)
    const checkoutBtn = cartModal.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          alert('Proceeding to checkout!');
          // Optional: redirect to checkout page here
        });
    }
}


/* ========== Update Cart Count in Header =========== */
function updateCartCount() {
  const cartCount = document.querySelector('.cart-icon span');
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}

/* ========== Local Storage Functions =========== */
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
        cart = JSON.parse(storedCart);
        // Ensure loaded items have a quantity property in case it was missing in older saves
        cart = cart.map(item => ({ ...item, quantity: item.quantity || 1 }));
    } catch (e) {
        console.error("Error loading cart from local storage:", e);
        cart = []; // Clear cart if loading fails
    }
  }
}

// Make addToCart and removeFromCart globally available for products.js
// These functions are now the primary way to modify the cart
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

// Define addToCart function (now the main one)
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  updateCartCount();
  saveCartToLocalStorage();
  renderCart(); // Re-render cart modal after adding
}

// Define removeFromCart function (now the main one)
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartCount();
  saveCartToLocalStorage();
  renderCart(); // Re-render cart modal after removing
}
