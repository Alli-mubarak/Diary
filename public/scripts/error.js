const html = document.querySelector('html');
const themeToggle = document.querySelector('.theme');
const errorImage = document.getElementById("error-image");

// toggle theme

let isDark = false;

function setLightTheme(){
    html.removeAttribute('class','dark');
    isDark = false;
    themeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    errorImage.src = "/images/error.png";
}

function setDarkTheme(){
    html.setAttribute('class','dark');
    isDark = true;
    themeToggle.innerHTML = `<i class="fa-regular fa-moon"></i>`;
    errorImage.src = "/images/error-dark.png";
}

themeToggle.onclick = () =>{
    if(isDark){
        setLightTheme();
    }else{
        setDarkTheme();
    }
}

//theme autoset
const d = new Date()
const hour = d.getHours();

if(hour > 6 && hour < 19){
    setLightTheme();
}else{
    setDarkTheme();
    }
