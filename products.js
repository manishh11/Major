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
  }
};

const ProductsWrapper = document.getElementById("products-wrapper");

window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  displayProductItems(products);
  loadCartFromLocalStorage();
});

/* ========== Display Products =========== */
const displayProductItems = (items) => {
  let displayProduct = items.map(
    (product) => ` 
      <div class="swiper-slide">
        <div class="card d-flex">
          <div class="image"><img src=${product.url} alt=""></div>
          <div class="rating">
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
          </div>
          <h4>${product.title}</h4>
          <div class="price">
            <span>Price</span><span class="color">Rs.${product.price}</span>
          </div>
          <div class="button btn add-to-cart" data-id="${product.id}">Add To Cart+</div>
        </div>
      </div>
    `
  );

  displayProduct = displayProduct.join("");
  if (ProductsWrapper) {
    ProductsWrapper.innerHTML = displayProduct;

    // Add event listeners to all add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = parseInt(e.target.getAttribute('data-id'));
        const product = items.find(item => item.id === productId);
        if (product) {
          addToCart(product);
          e.target.textContent = 'Added!';
          setTimeout(() => {
            e.target.textContent = 'Add To Cart+';
          }, 1000);
        }
      });
    });
  }
};

/* ========== Filter Products =========== */
const filters = [...document.querySelectorAll(".filters span")];

filters.forEach((filter) => {
  filters[0].classList.add("active");
  filter.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-filter");
    const target = e.target;
    const products = await getProducts();
    filters.forEach((btn) => {
      btn.classList.remove("active");
    });
    target.classList.add("active");

    let menuCategory = products.filter((product) => product.category === id);

    if (id === "All Product") {
      displayProductItems(products);
    } else {
      displayProductItems(menuCategory);
    }
    swiper.update();
  });
});

/* ========== Cart Functionality =========== */
let cart = [];

function updateCartCount() {
  const cartCount = document.querySelector('.cart-icon span');
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}

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
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartCount();
  saveCartToLocalStorage();
}

function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}
