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
