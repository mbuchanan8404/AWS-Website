//------------------------------------------------------------------------
//-----------------------------POSTSESSION.JS-----------------------------
//------------------------------------------------------------------------

/**postsession.js is responsible for handling storage of user variables on
 * the servers end. Stores variables such as User_Login and privs.
 * Use session as opposed to cookies because the user cannot alter session.
*/

let dbUserManager = require('../back-end/dbItems/dbItemsManager.js');

/* Create session variables based on username and password*/
async function processLoginSession(req){
    let username = req.body.User_Login;

    let userInfo = await dbUserManager.readUserByLogin(username);

    if(!userInfo)
        return "User could not be found";
    if(!attemptReq(req))
        return "req does not exist";
    
    let admin = userInfo.Items[0].Administrator;

    let privs = ["home"];
    if(admin){
        privs = ["home","calendar","account","dashboard","registration","events"];
    } else{
        privs = ["home","calendar"];
    }

    createSession(req,"User_Login",username);
    createSession(req,"privs",privs);

    return true;
}


/* Get the session based on key value*/
function getSession(req,key){

    //Return if req does not exist
    if(!attemptReq(req))
        return false;
    
    return req.session[key];
 }
 

/* Create session based on key and value*/
 function createSession(req,key,value){

    //Return if req does not exist
    if(!attemptReq(req))
        return false;
    
    req.session[key] = value;
    return true;
 }
 

/* Clear entire session*/
 function clearSession(req){
    
    //Return if req does not exist
    if(!attemptReq(req))
        return false;
    
    //Essential sessions we would like to keep
    const tags = ["cookie"];

    let ssn = req.session;

    //Remove each session element
    for(let element in ssn){
        //if its not an essential element, then remove it
        if(!tags.includes(element)){
            deleteSession(req,element);
        }
    }
    return true;
 }


/* Delete session based on key */
 function deleteSession(req,key){
    
    //Return if req does not exist
    if(!attemptReq(req))
        return false;

    //Delete session
    return delete req.session[key];
 }


/* Checks if user has specified privilege*/
 function checkPrivs(req,priv){
    if(!attemptReq(req))
        return false;

    //If privs have not been defined, return false.
    if(!req.session.privs)
        return false;

    let privs = req.session.privs;

    //Return true iff user has access to privlege
    return privs.includes(priv);
 }

 
/* Check if req has a session*/
 function attemptReq(req){
    //try to get req, then req.session
    //if either fail, return err
    try{
        if(!req)
            throw "req does not exist!"
        if(!req.session)
            throw "req.session does not exist!"
    }catch(err){
        console.error(err);
        return false;
    }

    //return true if both exist
    return true;
 }

 //Export functions
 module.exports = {
    processLoginSession,clearSession,checkPrivs,getSession,createSession
 }