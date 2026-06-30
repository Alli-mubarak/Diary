
//All characters compiled in a string
const chars = `F.,éêēèëūüúûùìïíîīóôöòœøōõàáâäāåãæßñç'"@:&~70°)r^K•B6;/PDH#_T=seXhu✓vJM(I®©?LQa¢YNm5A|8fG€inZwgx9√%W!t¥jpdU4co$2V3Rklq1y£zOEbCS F.,éêēèëūüúûùìïíîīóôöòœøōõàáâäāåãæßñç'"@:&~70°)r^K•B6;/PDH#_T=seXhu✓vJM(I®©?LQa¢YNm5A|8fG€inZwgx9√%W!t¥jpdU4co$2V3Rklq1y£zOEbCS `;

function encrypt(text, salt){
const keyDigit = chars.length / 2
   const helperDigit = keyDigit % salt;
         let encryptedText = '';
         for (let i=0; i < text.length; i++){
     if(chars.includes(text.charAt(i))){
        let textToAdd = chars.charAt(chars.indexOf(text.charAt(i)) + helperDigit);
        if(textToAdd === " "){
            encryptedText += '📝'
        }else{
         encryptedText += textToAdd ;
         }
         }else{
             encryptedText += text.charAt(i)
     }
         }
         return encryptedText;  
}

function decrypt(encryptedText, salt){
    const keyDigit = chars.length / 2;
         let plainText = '';
    const helperDigit = keyDigit % salt;
    
    if(encryptedText.includes('📝')){
    encryptedText = encryptedText.replaceAll('📝', ' ')
        
    }
         
         for (let i = 0; i < encryptedText.length; i++){
            if(chars.includes(encryptedText.charAt(i))){
         const inDex = chars.indexOf(encryptedText.charAt(i)) - helperDigit;
         if(inDex >= 0){
     plainText += chars.charAt(inDex);
     }else{
         plainText +=chars.charAt(inDex + keyDigit);
         
     }
      }else{
         plainText += encryptedText.charAt(i)
            }
         }
     return plainText;
         }

function getSalt(id){
 const saltValues = [3,5,7,9]
 let availables = "";
  for(let i=0;i<id.length;i++){
     if(Number(id.charAt(i))){
            let num = Number(id.charAt(i))
            if(saltValues.includes(num)){
                availables += num
            }
            
         }
     }
if(availables.length > 0){
return Number(availables.charAt(availables.length - 1))
}
return Number(saltValues[2])
  }

export {encrypt, decrypt, getSalt}
   
