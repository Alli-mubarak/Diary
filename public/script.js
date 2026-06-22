const BACKEND_URL = '';

    // 1. Check if user is logged in when page loads
    async function checkAuthStatus() {
      try {
        // 'credentials: include' forces the browser to send the session cookie
        const response = await fetch(`${BACKEND_URL}/api/auth/user`, { credentials: 'include' });
        const data = await response.json();

        const authSection = document.getElementById('auth-section');

        if (data.loggedIn) {
          // User is authenticated! Display details saved from MongoDB
          authSection.innerHTML = `
            <h2>Welcome back, ${data.user.displayName}!</h2>
            <img src="${data.user.profilePic}" width="50" style="border-radius:50%">
            <p>Email: ${data.user.email}</p>
            <p>Your Total Posts: ${data.user.posts.length}</p>
            <button onclick="logoutUser()">Log Out</button>
          `;
        } else {
          // User cookie expired or doesn't exist
          authSection.innerHTML = `
            <h2>Please sign up or log in</h2>
            <!-- Point directly to your backend route -->
            <a href="${BACKEND_URL}/auth/google"><button>Sign In with Google</button></a>
          `;
        }
      } catch (err) {
        console.error("Error verifying authentication status:", err);
      }
    }

    // 2. Handle logging out
    function logoutUser() {
      // Redirect browser directly to backend logout route to clear cookie
      window.location.href = `${BACKEND_URL}/logout`;
    }

    // Initialize check on load
  //  checkAuthStatus();
  




// Get DOM elements from HTML
const entryInput = document.getElementById('entry');
const toggleCtrl = document.querySelector('.toggle');
const inputBox = document.getElementById('inputBox');
const addButton = document.getElementById('add-button');
const entriesDiv = document.getElementById('entries');
const themeToggle = document.querySelector('.theme');
const searchIcon = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const errorBox = document.getElementById('error-box');
const searchInput = document.getElementById('search-input');
const signInBtn = document.getElementById('sign-in-btn');


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

if(hour > 6 && hour < 17){
    html.removeAttribute('class','dark');
        isDark = false;
        themeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`
}else{
    html.setAttribute('class','dark');
        isDark = true;
        themeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`
}

// toggle the entry adder container
let isAdderOpen = false;
toggleCtrl.onclick = () =>{
    if(!isAdderOpen){
     inputBox.style.height = 'auto';
        isAdderOpen = true;
        toggleCtrl.style.transform = 'rotate(135deg)';
        return 
    }
        inputBox.style.height = '0';
        isAdderOpen = false;
    toggleCtrl.style.transform = 'rotate(0deg)';
}
//search Functionality
let isSearchBoxOpen = false;
let searchText;
searchIcon.onclick = () =>{
  searchForm.reset()
  if(!isSearchBoxOpen){
  searchForm.style.display = 'flex';
  isSearchBoxOpen = true;
}else{
  searchForm.style.display = 'none';
  isSearchBoxOpen = false;
 getEntries(displayEntries);
}
  
}
searchForm.addEventListener('submit',(e) => {
  e.preventDefault()
  searchText = searchForm.search.value;
    if(searchText.length > 0){
  getEntries(search)
    }
})
searchInput.addEventListener('input', () =>{
  if(searchInput.value === ''){
    getEntries(displayEntries)
  }
})
const apiKey = 'Arrfayygjjiggjvfgjkj7534ghgcc';
//const apiUrl = 'http://localhost:39693';
const apiUrl = ''

//loader Function
function load(){
  entriesDiv.innerHTML = ` <p class="loader"></p>
    <p class="loader"></p>
    <p class="loader"></p>
    <p class="loader"></p>
        <p class="loader"></p>
            <p class="loader"></p>
                <p class="loader"></p>`
}

// Function to add new entry
inputBox.onsubmit = (e) =>{
  e.preventDefault();
  // . Gather form data
    const formData = new FormData(inputBox);
    // Convert FormData to a plain object and then to a JSON string
    const entryText = JSON.stringify(Object.fromEntries(formData.entries())); 
 const txtL = inputBox.description.value.length
  if(txtL > 0){
    entryInput.disabled = true;
const requestOptions = {
  method: 'post',
  headers: {
    'Authorization': `Bearer ${apiKey}`, // Standard practice for API keys/tokens
    'Content-Type': 'application/json' // Specify the content type
  },
  body : entryText
}
const addApi = `${apiUrl}/add`;
fetch(addApi, requestOptions)
  .then(response => response.json())
  .then(data => {
    let st = ''
    for (i in data){
      st+= i+':'+ data[i];
    }
    getEntries(displayEntries);
      entryInput.disabled = false;
  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)});
  entryInput.value = '';
  // Add event listener to delete button
  const deleteButtons = document.getElementsByClassName('delete');
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', deleteEntry);
  }
  
   // Add event listener to edit button
  const editButtons = document.getElementsByClassName('edit');
  for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener('click', editEntry);
  }
  }else{
  alert('Input cannot be empty!')
  }
}

// get all entries
function getEntries(fn){
  //load()
  errorBox.classList.add('hidden');
  const getAllApi = `${apiUrl}/getEntries`;
  const requestOptions = {
  method: 'get',
  headers: {
    'Authorization': `Bearer ${apiKey}`, // Standard practice for API keys/tokens
    'Content-Type': 'application/json' // Specify the content type
  }
}
fetch(getAllApi, requestOptions)
  .then(response => response.json())
  .then(data => {
    entriesDiv.style.height = 'calc(100dvh - 130px)';
    
    fn(data)

  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)})
}

//function that renders entries to the UI
function displayEntries(data){
    entriesDiv.innerHTML = '';
      for (let i=data.length-1; i >=0; i--){
      const d = new Date(data[i].createdAt);
      const timeDate = d.toLocaleString();
      const entryHTML = `<p id='${data[i]._id}'><b>${data[i].description}</b> <button class="edit" onclick='editEntry(this)'>Edit</button> <button class="delete" onclick='deleteEntry(this)'>Delete</button><span class='timeAdded'>${timeDate}</span></p>`;
 entriesDiv.innerHTML += entryHTML;
    }
}
// function for searching
function search(data){
  let entryHTML = '';
    
      for (let i=data.length-1; i >=0; i--){
      const d = new Date(data[i].createdAt);
      const timeDate = d.toLocaleString();
      searchText = new RegExp(searchText,"gi");
      
      if(data[i].description.search(searchText) > 0){
        
      entryHTML+= `<p id='${data[i]._id}'><b>${data[i].description}</b> <button class="edit" onclick='editEntry(this)'>Edit</button> <button class="delete" onclick='deleteEntry(this)'>Delete</button><span class='timeAdded'>${timeDate}</span></p>`;
      }
      }
      entriesDiv.innerHTML = entryHTML;
      
      if(!entryHTML){
   entriesDiv.style.height = '0';
   errorBox.classList.remove('hidden');
 }
}

// Function to delete entry
function deleteEntry(e) {
if(confirm('Are you sure you want to delete this entry?')){
    entryID = e.parentNode.id
    deleteApi = `${apiUrl}/deleteEntry/${entryID}`;
      const requestOptions = {
  method: 'delete',
  headers: {
    'Authorization': `Bearer ${apiKey}`, // Standard practice for API keys/tokens
    'Content-Type': 'application/json' // Specify the content type
  }
}
fetch(deleteApi, requestOptions)
  .then(response => response.json())
  .then(data => {
    let st = ''
    for (i in data){
      st += data[i]
      
    }
    alert(st)
    getEntries(displayEntries);
  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)})
}
}
 

function editEntry(e){
let container = e.parentNode
  let text =  container.children[0];
  if(text.innerHTML.length > 0){
  if(!container.isEdited){
  text.setAttribute('class','highlight');
  text.setAttribute('contenteditable','true');
  e.innerHTML = 'Save';
  container.isEdited = true;
  return
  }
  text.removeAttribute('class','highlight');
  e.innerHTML = 'Edit';
  text.removeAttribute('contenteditable','true');
  container.isEdited = false
  
  entryID = e.parentNode.id
  newDescription = {description: text.innerHTML}
    editApi = `${apiUrl}/editEntry/${entryID}`;
      const requestOptions = {
  method: 'post',
  headers: {
    'Authorization': `Bearer ${apiKey}`, // Standard practice for API keys/tokens
    'Content-Type': 'application/json' // Specify the content type
  },
  body: JSON.stringify(newDescription)
}
fetch(editApi, requestOptions)
  .then(response => response.json())
  .then(data => {
    getEntries(displayEntries);
  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)})
}
}
getEntries(displayEntries);  

//Google login
// Example frontend function sending the token to your Node.js server
async function handleGoogleLogin(response) {
    const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }), // Sent to backend
    });
    const data = await res.json();
    console.log('Logged in user data:', data);
}


signInBtn.onclick = () =>{
    console.log('initiating sign in....');
}
