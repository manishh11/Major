/* ========== Products Slider =========== */
const swiper = new Swiper(".mySwiper", {
  grabCursor: true,
  slidesPerView: 1,
  spaceBetween: 30,
  pagination: {
    el: ".custom-pagination",
    clickable: true,
  },
  breakpoints: {
    567: {
      slidesPerView: 2,
    },
    996: {
      slidesPerView: 3,
    },
    1200: {
      slidesPerView: 4,
    },
  },
});

/* ========== Fetch the Products =========== */
const getProducts = async () => {
  try {
    const results = await fetch("./data/products.json");
    const data = await results.json();
    const products = data.products;
    return products;
  } catch (err) {
    console.log(err);
    return []; // Return empty array on error
  }
};

// Make getProducts available globally for calorie-calculator.js
const getProductsGlobal = getProducts;


const ProductsWrapper = document.getElementById("products-wrapper");

window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  displayProductItems(products);
  // loadCartFromLocalStorage is now handled in cart.js
});

/* ========== Display Products =========== */
const displayProductItems = (items) => {
  if (!ProductsWrapper) return; // Don't proceed if the wrapper isn't found

  let displayProduct = items.map(
    (product) => `
      <div class="swiper-slide">
        <div class="card">
          <div class="image"><img src="${product.url}" alt="${product.title}"></div>
          <div class="rating">
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
          </div>
          <h4>${product.title}</h4>
          <div class="price">
            <span>Price</span><span class="color">${product.price}</span>
          </div>
          ${product.calories ? `<div class="calories">Calories: ${product.calories} kcal</div>` : ''}
          ${product.meal_type && product.meal_type.length > 0 ?
            `<div class="meal-types">Meal Types: ${product.meal_type.map(tag => `<span class="tag meal-type-tag">${tag}</span>`).join(', ')}</div>` : ''}
          ${product.diet_tags && product.diet_tags.length > 0 ?
            `<div class="diet-tags">Diet: ${product.diet_tags.map(tag => `<span class="tag diet-tag">${tag}</span>`).join(', ')}</div>` : ''}
          <div class="button add-to-cart" data-id="${product.id}">Add To Cart+</div>
        </div>
      </div>
    `
  );

  displayProduct = displayProduct.join("");
  ProductsWrapper.innerHTML = displayProduct;

  // Add event listeners for "Add To Cart" buttons after rendering
  // Ensure addToCart function is available from cart.js
  ProductsWrapper.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', async (e) => {
          const productId = parseInt(e.target.getAttribute('data-id'));
          const products = await getProducts(); // Fetch products again to get full details
          const productToAdd = products.find(p => p.id === productId);
          if (productToAdd && typeof addToCart === 'function') { // Check if addToCart is defined
              addToCart(productToAdd);
          } else if (!productToAdd) {
              console.error("Product not found with ID:", productId);
          } else {
              console.error("addToCart function is not defined.");
          }
      });
  });
};

/* ========== Products Filtering =========== */
const filters = document.querySelectorAll('.filters span');

filters.forEach(filter => {
  filter.addEventListener('click', async (e) => {
    const id = e.target.getAttribute("data-filter");
    const target = e.target;
    const products = await getProducts();

    filters.forEach((btn) => {
      btn.classList.remove("active");
    });
    target.classList.add("active");

    let menuCategory = products;
    if (id !== "All Product") {
       menuCategory = products.filter((product) =>
           product.category === id ||
           (product.meal_type && product.meal_type.includes(id.toLowerCase().replace(' ', '_'))) || // Check meal_type
           (product.diet_tags && product.diet_tags.includes(id.toLowerCase().replace(' ', '_'))) // Check diet_tags
       );
    }

    displayProductItems(menuCategory);
    // Update swiper to reflect new slide count and content
    if (swiper) {
        swiper.update();
        swiper.slideTo(0, 0); // Go back to the first slide after filtering
    }
  });
});


// Ensure renderCart is called from cart.js after load
// window.addEventListener('load', () => {
//     loadCartFromLocalStorage(); // This is now handled in cart.js
//     // Initial render of the cart modal (hidden by default)
//     // renderCart(); // This is now handled in cart.js
// });

