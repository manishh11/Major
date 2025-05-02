/* ========== Navigation =========== */
const hamburger = document.querySelector(".hamburger");
const close = document.querySelector(".nav-list .close");
const menu = document.querySelector(".nav-list");

hamburger.addEventListener("click", () => {
  menu.classList.add("show");
});

close.addEventListener("click", () => {
  menu.classList.remove("show");
});

/* ========== SignIn Form =========== */
const signInBtn = document.querySelector(".signin");
const signInForm = document.querySelector("header .wrapper");

signInBtn.addEventListener("click", () => {
  signInForm.classList.add("active");
});

document.querySelector(".close-form").addEventListener("click", () => {
  signInForm.classList.remove("active");
  // Clear form and errors when closing
  const form = document.querySelector('.form');
  form.reset();
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(input => input.classList.remove('error'));
});
// Form Validation
document.addEventListener('DOMContentLoaded', function() {
  const signInForm = document.querySelector('.form');
  const emailInput = signInForm.querySelector('input[type="email"]');
  const passwordInput = signInForm.querySelector('input[type="password"]');
  const submitBtn = signInForm.querySelector('button[type="submit"]');
  const closeFormBtn = document.querySelector('.close-form');
  
  // Validate email format
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate form fields
  function validateForm() {
    let isValid = true;
    
    // Validate email
    const emailControl = emailInput.parentElement;
    const emailError = emailControl.querySelector('.error-message');
    
    if (!emailInput.value.trim()) {
      emailError.textContent = 'Email is required';
      emailError.classList.add('show');
      emailControl.classList.add('error');
      isValid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      emailError.textContent = 'Please enter a valid email';
      emailError.classList.add('show');
      emailControl.classList.add('error');
      isValid = false;
    } else {
      emailError.classList.remove('show');
      emailControl.classList.remove('error');
      emailControl.classList.add('success');
    }
    
    // Validate password
    const passwordControl = passwordInput.parentElement;
    const passwordError = passwordControl.querySelector('.error-message');
    
    if (!passwordInput.value.trim()) {
      passwordError.textContent = 'Password is required';
      passwordError.classList.add('show');
      passwordControl.classList.add('error');
      isValid = false;
    } else if (passwordInput.value.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      passwordError.classList.add('show');
      passwordControl.classList.add('error');
      isValid = false;
    } else {
      passwordError.classList.remove('show');
      passwordControl.classList.remove('error');
      passwordControl.classList.add('success');
    }
    
    // Disable button if invalid
    submitBtn.disabled = !isValid;
    return isValid;
  }

  // Form submit handler
  signInForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the data to your server
      submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Processing...';
      
      // Simulate API call
      setTimeout(() => {
        alert('Login successful!');
        signInForm.reset();
        signInForm.classList.remove('active');
        submitBtn.innerHTML = 'Sign In';
        
        // Remove success classes
        document.querySelectorAll('.control').forEach(control => {
          control.classList.remove('success');
        });
      }, 1500);
    }
  });
  
  // Real-time validation on input
  emailInput.addEventListener('input', function() {
    validateForm();
  });
  
  passwordInput.addEventListener('input', function() {
    validateForm();
  });
  
  // Close form handler
  closeFormBtn.addEventListener('click', function() {
    signInForm.classList.remove('active');
    signInForm.reset();
    submitBtn.disabled = false;
    
    // Clear all errors and states
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.classList.remove('show');
    });
    
    document.querySelectorAll('.control').forEach(control => {
      control.classList.remove('error', 'success');
    });
  });
  
  // Initial validation check
  validateForm();
});