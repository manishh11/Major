/* ========== Navigation =========== */
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector(".hamburger");
  const closeNav = document.querySelector(".nav-list .close");
  const menu = document.querySelector(".nav-list");

  if (hamburger && menu && closeNav) {
    hamburger.addEventListener("click", () => {
      menu.classList.add("show");
    });

    closeNav.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  }

  /* ========== SignIn Form Toggle =========== */
  const signInBtn = document.querySelector(".signin");
  const signInFormWrapper = document.querySelector("header .wrapper"); // The overlay for the sign-in form
  const closeFormBtn = document.querySelector(".close-form");
  const formElement = signInFormWrapper ? signInFormWrapper.querySelector('.form') : null; // The actual form inside the wrapper

  if (signInBtn && signInFormWrapper && closeFormBtn) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default link behavior
      signInFormWrapper.classList.add("active");
      // Clear form and errors when opening (ensure signin-form-validation.js handles this too)
      if (formElement) {
        formElement.reset();
        // Assuming error messages are handled by signin-form-validation.js,
        // but adding a general clear for inputs if needed.
        document.querySelectorAll('.control input').forEach(input => input.classList.remove('error', 'success'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
      }
    });

    closeFormBtn.addEventListener("click", () => {
      signInFormWrapper.classList.remove("active");
      // Clear form and errors when closing
      if (formElement) {
        formElement.reset();
        document.querySelectorAll('.control input').forEach(input => input.classList.remove('error', 'success'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
      }
    });
  }

  /* ========== Cart Dropdown Toggle Logic =========== */
  const cartIcon = document.querySelector('.cart-icon');
  const cartDropdown = document.querySelector('.cart-dropdown');

  if (cartIcon && cartDropdown) {
    cartIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent clicks inside from closing immediately
      cartDropdown.classList.toggle('active');
    });

    // Close the cart dropdown if a click occurs outside of it
    document.addEventListener('click', (event) => {
      // Check if the click is outside the cart dropdown AND outside the cart icon
      if (!cartDropdown.contains(event.target) && !cartIcon.contains(event.target)) {
        cartDropdown.classList.remove('active');
      }
    });

    // Prevent clicks inside the dropdown from closing it
    cartDropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });
  }
});
