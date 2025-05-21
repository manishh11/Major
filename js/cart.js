/* ========== Cart System =========== */
// Cart array (defined once here)
let cart = [];

// DOM elements for cart display
const cartIconCount = document.querySelector('.cart-icon span');
const cartItemsContainer = document.querySelector('.cart-items-container');
const cartTotalPriceElement = document.querySelector('.cart-total-price');
const emptyCartMessage = document.querySelector('.empty-cart-message');
const checkoutBtn = document.querySelector('.checkout-btn'); // Get the checkout button

// Load cart from local storage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    renderCart(); // Initial render of the cart dropdown
});

/* ========== Helper: Calculate Total =========== */
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
}

/* ========== Render Cart Dropdown Content =========== */
function renderCart() {
  if (!cartItemsContainer || !cartTotalPriceElement || !cartIconCount) return; // Ensure elements exist

  cartItemsContainer.innerHTML = ''; // Clear existing items

  if (cart.length === 0) {
    emptyCartMessage.style.display = 'block'; // Show empty message
    cartTotalPriceElement.textContent = 'Rs. 0.00';
    if (checkoutBtn) checkoutBtn.style.display = 'none'; // Hide checkout button if cart is empty
  } else {
    emptyCartMessage.style.display = 'none'; // Hide empty message
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.dataset.id = item.id; // Store product ID for easy access

        cartItemDiv.innerHTML = `
            <img src="${item.url || 'https://placehold.co/70x70/EAEAEA/69697B?text=Food'}" alt="${item.title}">
            <div class="item-details">
                <h4>${item.title}</h4>
                <p>Price: Rs ${item.price}</p>
                <div class="item-quantity-controls">
                  <button class="quantity-btn minus" data-id="${item.id}">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}"><i class="bx bx-trash"></i></button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
    cartTotalPriceElement.textContent = `Rs. ${calculateCartTotal()}`;
    if (checkoutBtn) checkoutBtn.style.display = 'block'; // Show checkout button
  }

  // Update the cart icon's item count
  cartIconCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

  // Re-attach event listeners for dynamically created buttons
  addCartItemEventListeners();
}

/* ========== Add Event Listeners to Cart Items =========== */
function addCartItemEventListeners() {
    // Handle quantity decrease
    document.querySelectorAll('.cart-item .minus').forEach(btn => {
      btn.onclick = (e) => { // Use onclick for simplicity on dynamically added elements
        const itemId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === itemId);
        if (item) {
          if (item.quantity > 1) {
            item.quantity -= 1;
          } else {
            // If quantity is 1, remove the item entirely
            removeFromCart(itemId);
            return; // Exit to prevent re-rendering twice
          }
          saveCartToLocalStorage();
          renderCart();
        }
      };
    });

    // Handle quantity increase
    document.querySelectorAll('.cart-item .plus').forEach(btn => {
      btn.onclick = (e) => {
        const itemId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += 1;
            saveCartToLocalStorage();
            renderCart();
        }
      };
    });

    // Handle item removal
    document.querySelectorAll('.cart-item .remove-item').forEach(btn => {
      btn.onclick = (e) => {
        const itemId = parseInt(e.target.dataset.id); // Use dataset.id
        removeFromCart(itemId);
      };
    });

    // Checkout button listener
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
          // Instead of alert, you might want a custom modal or redirect
          console.log('Proceeding to checkout!');
          // Example: Hide cart dropdown after checkout action
          document.querySelector('.cart-dropdown').classList.remove('active');
          // Implement your checkout logic here (e.g., redirect to checkout page)
        };
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
        // Ensure loaded items have a quantity property in case it was missing
        cart = cart.map(item => ({ ...item, quantity: item.quantity || 1 }));
    } catch (e) {
        console.error("Error loading cart from local storage:", e);
        cart = []; // Clear cart if loading fails
    }
  }
}

// Make addToCart and removeFromCart globally available for products.js
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

// Define addToCart function (main function for adding items)
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      url: product.url, // Make sure product.url is available for the image
      quantity: 1
    });
  }
  saveCartToLocalStorage();
  renderCart(); // Re-render cart dropdown after adding
}

// Define removeFromCart function (main function for removing items)
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToLocalStorage();
  renderCart(); // Re-render cart dropdown after removing
}
