//home.js is responsible for hosting frontend functions that work on the home.html

import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';


//------------------------------------------------------------------------
//---------------------------FUNCTIONS------------------------------------
//------------------------------------------------------------------------

/**
 * onLoadPage() triggers whenever the user opens an html document
 * References handler_frontend.js to display the header elements
 * (Requirement 3.0.0) (Requirement 3.1.0)
*/
async function onLoadPage(){
    displayHeaderElements("home");
}


/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
    logout();
}

//Set scope of methods to window so html documents can access
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;