/**
 * aes.js is responsible for some of the encryption and decryption functions for the users passwords.
 * Cipher Block Chaining (CBC) will be responsible due to its simplicity and effectiveness in hashing users passwords.
*/

/* Import the required modules */
var aesjs = require('aes-js');
var {getPublicKeyArray} = require('../../environment/envprocess.js');


/* Retrieve the public key array from envprocess */
var key_128 = getPublicKeyArray();

/* IV_SIZE stays a constant 16 per password */
const IV_SIZE = 16;


var IV = generateIV();

/* Generate random IV for each new password */
function generateIV(){
    //Create a temporary array
    let tempIV = new Uint8Array(IV_SIZE);

    //Append random elements to our array
    for(let i = 0;i<IV_SIZE;i++){
        tempIV[i] = Math.floor(Math.random()*255);
    }
    return tempIV;
}


/* Create a CBC object based on IV */
function createCBC(iv){
    return new aesjs.ModeOfOperation.cbc(key_128,iv);
}


/* Add filler to fit correct size for CBC */
function addFiller(text){
    //convert text into a byte array with ascii values
    let list = aesjs.utils.utf8.toBytes(text);

    //create empty list with length that is divisible by 16 for CBC encryption
    let mod16List = new Uint8Array(Math.ceil(list.length/16)*16);

    //put in place all elements of list
    mod16List.set(list);

    //convert array into string
    var fillerString = new TextDecoder().decode(mod16List);

    //return string with padded characters
    return fillerString;
}


/* Remove blank spaces in string */
function trimText(text){
    //convert text into a array so we can slice ascii 0s
    let list = aesjs.utils.utf8.toBytes(text);

    //find the first index of 0
    let index = list.indexOf(0);

    //slice the list so non-padded characters are present.
    list = list.slice(0,index);

    //convert array into a string
    let trimText = new TextDecoder().decode(list);

    //return sliced string
    return trimText;
}


/* Encrypt users password */
function encrypt(plainText){

    //add filler text so its within 16 bytes
    plainText = addFiller(plainText);
    
    //change plaintext string into bytes array
    let textBytes = aesjs.utils.utf8.toBytes(plainText);

    //create aesCBC object with IV
    let aesCBC = createCBC(IV);

    //encrypt byte array with aesCBC obect
    let encryptedBytes = aesCBC.encrypt(textBytes);
    
    //change encrypted byte array into hex form
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    //prepend the IV to encrypted passsword
    encryptedHex = prependIV(IV,encryptedHex)

    //return IV + ciphertext
    return encryptedHex;       
}


/* Decrypt the password */
function decrypt(cipherText){

    //extract the IV from ciphertext
    let extracted = extractIV(cipherText);

    //turn extracted IV into byte array
    let arrayIV = aesjs.utils.hex.toBytes(extracted.IV);

    //turn extracted text into byte array
    let encryptedBytes = aesjs.utils.hex.toBytes(extracted.text);

    //create aesCBC object with arrayIV
    let aesCBC = createCBC(arrayIV);

    //decrypt byte array with aesCBC object
    let decryptedBytes = aesCBC.decrypt(encryptedBytes);

    //change byte array into string
    let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    //trim text so no floating 0s are present
    decryptedText = trimText(decryptedText);

    //return the decrypted text
    return decryptedText;
}  


/* Prepend the IV to the encrypted string */ 
function prependIV(iv,text){
    //convert IV array into a string of hex characters
    let byteToHex = Buffer.from(iv).toString('hex');

    //prepend
    let combined = byteToHex + text;

    //return prepended string
    return combined;
}


/* Extract the IV from string of text */
function extractIV(text){
    //extract IV from text
    let substringIV = text.substring(0,IV_SIZE*2);
    
    //extract ciphertext from text
    let substringText = text.substring(IV_SIZE*2);

    //return both IV and text
    return {IV:substringIV,text:substringText};
}


/* Export public methods */
module.exports = {
    encrypt,decrypt
}