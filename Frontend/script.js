
// Get elements from HTML
const entryInput = document.getElementById('entry');
const toggleCtrl = document.querySelector('.toggle');
const inputBox = document.getElementById('inputBox');
const addButton = document.getElementById('add-button');
const entriesDiv = document.getElementById('entries');
const themeToggle = document.querySelector('.theme');
const themeInner = document.querySelector('.t-inner');

// toggle theme
const html = document.querySelector('html');
let isDark = false;
themeToggle.onclick = () =>{
    if(isDark){
        html.removeAttribute('class','dark');
        isDark = false;
        themeInner.style.left = '6px';
        themeInner.style.boxShadow = '0 0 0 orange';
        themeToggle.style.boxShadow = '-2px 0 1px #fff055 ';
    }else{
        html.setAttribute('class','dark');
        isDark = true;
        themeInner.style.left = '3%';
        themeInner.style.boxShadow = '0 0 15px orange';
        themeToggle.style.boxShadow = '0 0 0 #fff055 ';
    }
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

const apiKey = 'Arrfayygjjiggjvfgjkj7534ghgcc';
const apiUrl = 'http://localhost:39693';


// Function to add new entry
inputBox.onsubmit = (e) =>{
  e.preventDefault();
  // . Gather form data
    const formData = new FormData(inputBox);
    // Convert FormData to a plain object and then to a JSON string
    const entryText = JSON.stringify(Object.fromEntries(formData.entries())); 
 const txtL = inputBox.description.value.length
  if(txtL > 0){
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
    getEntries();
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
function getEntries(){
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
    entriesDiv.innerHTML = '';
    for (let i=data.length-1; i >=0; i--){
      const d = new Date(data[i].createdAt);
      const timeDate = d.toLocaleString();
      const entryHTML = `<p id='${data[i]._id}'><b>${data[i].description}</b> <button class="edit" onclick='editEntry(this)'>Edit</button> <button class="delete" onclick='deleteEntry(this)'>Delete</button><span class='timeAdded'>${timeDate}</span></p>`;
 entriesDiv.innerHTML += entryHTML;
    }
  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)})
}

// Function to delete entry
function deleteEntry(e) {
if(confirm('Are you sure you want to delete this entry?')){
    entryID = e.parentNode.id
    deleteApi = `${apiUrl}/deleteEntry/${entryID}`;
      const requestOptions = {
  method: 'post',
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
    getEntries();
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
    getEntries();
  })
  .catch(error => {
    alert(error)
    console.error('Error:', error)})
}
}
getEntries();