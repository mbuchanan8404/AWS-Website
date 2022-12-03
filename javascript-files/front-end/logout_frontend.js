//-------------------------------------------------------
//-----------------------LOGOUT.JS-----------------------
//-------------------------------------------------------


const PORT = 8080;

//Responsible for sending post request when the user logs out.
/* Requirement (8.2.0) */
export async function logout(){
  const pageURL = '/logout';

  let res = await fetch(pageURL, 
    {
        method: 'post'
    });

    window.location.pathname = "/login";
}

//Set scope of methods to window so html documents can access
window.logout = logout;
