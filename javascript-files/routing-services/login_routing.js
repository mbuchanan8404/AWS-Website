//------------------------------------------------------------------------
//-----------------------LOGIN_ROUTING.JS---------------------------------
//------------------------------------------------------------------------

//login_routing.js is responsible for redirecting and processing user login.


//------------------------------------------------------------------------
//----------------------------IMPORTS-------------------------------------
//------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const path = require('path');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');
const postsession = require('../environment/postsession.js');
const adAPI = require('../back-end/dbItems/dbItemsManager.js');

//------------------------------------------------------------------------
//---------------------------FUNCTIONS------------------------------------
//------------------------------------------------------------------------

/**
 * Add middleware functions to router
 * express.json() parses json functions
 * express.urlencoded() parses url encoding
 * express.static() makes the project directory visible to routing methods
*/
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(project_dir));


/* /login GET */
/* (Requirement 8.2.0) */
router.get('/login',(req,res) => {
    //remove login information
    postsession.clearSession(req);
    res.sendFile('login.html',{root:page_dir});
});


/* /login POST */
/* (Requirement 2.1.0) */
router.post('/login',async (req,res) =>{
    
    //Username and Password for user
    let User_Login = req.body.User_Login;
    let User_Password = req.body.User_Password;

    //Attempt to login
    //References dbUserManager.js
    let success = await adAPI.authenticateUser(User_Login,User_Password);
    
    //if not successful, redirect to login page
    /* (Requirement 2.3.0) */ 
    if(!success.valid){
      res.redirect('/login');
      return;
    }
  
    //Save session data and assign privledges 
    //References postsession.js
    await postsession.processLoginSession(req);
    
    //Redirect the user to the home page
    res.redirect('/home');
});

//      /login/registration post

//      Triggered whenever user clicks on register button
//      Grants user access to registration page
//      
/* (Requirement 2.2.0) */
router.get('/login/registration', async(req,res) =>{

  //Save session data and assign privlege
  //
  //References postsession.js
  postsession.createSession(req,"privs",["registration"]);

  //Redirect user to registration page
  res.redirect('/registration');
});

module.exports=router;