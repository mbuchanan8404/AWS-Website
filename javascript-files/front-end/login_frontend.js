//login_frontend.js is responsible for storing some of the login frontend methods.

/* Direct user to registration page */
/* (Requirement 2.2.0) */
async function register(){
  const pageURL = '/login/registration';

    //Put in a POST request to redirect user to registration page.
    let res = await fetch(pageURL, 
    {
        method: 'get'
    });

    //Redirect user to registration path
    window.location.pathname = "/registration";
}

//Set scope of methods to window so html documents can access
window.register = register;