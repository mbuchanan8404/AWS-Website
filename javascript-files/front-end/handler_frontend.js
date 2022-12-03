//------------------------------------------------------------------------
//----------------------HANDLER_FRONTEND.JS-------------------------------
//------------------------------------------------------------------------

/**
 * handler_frontend.js is responsible for hosting the functions generally used
 * on multiple html documents, notably generating the header.
*/

const PORT = 8080;

/* Get priv header and display them */
/* Requirement (8.3.0) */
export async function displayHeaderElements(page){
    let privs = await getHeaderPrivs(page);
    appendHeaderElements(privs);
}

/* Send GET request to get header privileges */
/* Requirement (8.3.0) */
async function getHeaderPrivs (page) {
  
    //put in a GET request to display information in header.
  const pageURL = '/' + page + '/header/';
  
  const res = await fetch(pageURL, 
      {
          method: 'GET'
      });

  //Convert res into json
  let data = await res.json();

  //Return only the array of privs in the json
  return data.privs;
}  

/* Takes array of privileges that the user has and appends it to html document.*/
function appendHeaderElements(privs){
    //If privs does not exist, return
    if(!privs)
        return;

    //Iterate through each of the users privileges
    privs.forEach(pageid=>{
        addInnerAHref(pageid,pageid,upperFirstLetter(pageid));
    });
}

/* Add individual links to document */
function addInnerAHref(link,elementID,text){
    document.getElementById("col-two").innerHTML += `<a href="${link}" id = "${elementID}">${text}</a>`;
}

/* Capitalize the first letter in a string */
function upperFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}