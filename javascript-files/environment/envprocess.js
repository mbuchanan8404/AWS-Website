
//envprocess.js is responsible for handling storing environment variables.


/* Return public key, Public key is used for encryption */
function loadPublicKey(){
    if(!process.env.PUBLIC_KEY)
        process.env.PUBLIC_KEY = "e98a3e81d3c4078a";
    return process.env.PUBLIC_KEY;
}

/* Returns public key in array form for encryption methods */
function getPublicKeyArray()
{
    //load in public key
    let publicKey = loadPublicKey();
    
    //method to turn dec number into hex
    const decimalToHex = dec => parseInt(dec,16);

    //make an array same length as public key
    let hexArray = new Uint8Array(publicKey.length);

    //convert each number to hex
    for(let i = 0;i<publicKey.length;i++)
        hexArray[i] = decimalToHex(publicKey[i]);

    //return array
    return hexArray;
}

//Export methods
module.exports = {
    getPublicKeyArray
}