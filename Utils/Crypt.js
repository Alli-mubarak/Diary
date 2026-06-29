
//All characters compiled in a string
const chars = `F.,éêēèëūüúûùìïíîīóôöòœøōõàáâäāåãæßñç'"@:&~70°)r^K•B6;/PDH#_T=seXhu✓vJM(I®©?LQa¢YNm5A|8fG€inZwgx9√%W!t¥jpdU4co$2V3Rklq1y£zOEbCS F.,éêēèëūüúûùìïíîīóôöòœøōõàáâäāåãæßñç'"@:&~70°)r^K•B6;/PDH#_T=seXhu✓vJM(I®©?LQa¢YNm5A|8fG€inZwgx9√%W!t¥jpdU4co$2V3Rklq1y£zOEbCS `;

function encrypt(text, salt){
const keyDigit = chars.length / 2
   const helperDigit = keyDigit % salt;
         let encryptedText = '';
         for (let i=0; i < text.length; i++){
        let textToAdd = chars.charAt(chars.indexOf(text.charAt(i)) + helperDigit);
         encryptedText += textToAdd ;
         }
         return encryptedText;  
}
function decrypt(encryptedText, salt){
    const keyDigit = chars.length / 2;
         let plainText = '';
    const helperDigit = keyDigit % salt;
         
         for (let i = 0; i < encryptedText.length; i++){
         const inDex = chars.indexOf(encryptedText.charAt(i)) - helperDigit;
         if(inDex >= 0){
     plainText += chars.charAt(inDex);
     }else{
         plainText +=chars.charAt(inDex + keyDigit);
         
     }
         }
     return plainText;
         }
export {encrypt, decrypt}
