const themeToggle = document.querySelector('.theme');
// toggle theme
const html = document.querySelector('html');
let isDark = false;
themeToggle.onclick = () =>{
    if(isDark){
        html.removeAttribute('class','dark');
        isDark = false;
        themeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`
    }else{
        html.setAttribute('class','dark');
        isDark = true;
        themeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`
    }
}

//theme autoset
const d = new Date()
const hour = d.getHours();

if(hour > 6 && hour < 19){
    html.removeAttribute('class','dark');
        isDark = false;
        themeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`
}else{
    html.setAttribute('class','dark');
        isDark = true;
        themeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`
}


const signupForm = document.getElementById('sign-up-form');
const formMessage = document.getElementById('form-message');


const API_URL = '/api/sign-up';


signupForm.addEventListener('submit', async (e) => {
  
  e.preventDefault(); 
const emailInput = signupForm.getElementById('email');
  const emailValue = emailInput.value.trim();
    
    // Strict Regex to enforce standard email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailValue === '') {
        formMessage.textContent = 'Email is required.';
        return 
    } else if (!emailRegex.test(emailValue)) {
        formMessage.textContent = 'Please enter a valid email address.';
        return
    } else {
  
  const submitButton = signupForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  // Automatically extract data from the input fields
  const formData = new FormData(signupForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    // Send a POST request to the server API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Inform server we are sending JSON data
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload) // Convert JavaScript object into a JSON string
    });

    // 6. Parse the server JSON response
    const data = await response.json();

    // 7. Handle success vs server-side validation/errors
    if (response.ok) {
      formMessage.textContent = 'Registration successful! Redirecting...';
      formMessage.style.color = 'green';
      signupForm.reset(); // Clear form fields
      
       window.location.href = '/dashboard';
    } else {
      // Server returned a bad status code (e.g., 400 Bad Request, 409 Email Exists)
      formMessage.textContent = data.message || 'Signup failed. Please try again.';
      formMessage.style.color = 'red';
    }

  } catch (error) {
    // Network errors (e.g., server is offline or internet disconnected)
    console.error('Network Error:', error);
    formMessage.textContent = 'Network error. Cannot reach the server.';
    formMessage.style.color = 'red';
  } finally {
    // Always re-enable the submit button when the operation finishes
    submitButton.disabled = false;
  }
    }
});
    
