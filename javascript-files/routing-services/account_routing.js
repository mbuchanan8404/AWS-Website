
const express = require('express');
const router = express.Router();
const path = require('path');
const dbAPI = require('../back-end/dbItems/dbItemsManager');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');
const dbInputValidation = require('../back-end/dbInputValidation')

//outside applications
const postsession = require('../environment/postsession.js');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//
//Determines if account page is visible
//(Requirement 5.0.0) 
//
router.get('/account',(req,res) => {   

    //check user privs to see if they have access to home
    /* (Requirement 8.0.0) */
    if(!postsession.checkPrivs(req,"account")){
        res.redirect('..');
        return;
    }

    res.sendFile('account.html',{root:page_dir})
});  

//
//Search button on account page
//(Requirement 5.1.0) 
//
router.get('/account/search/:uName', async(req,res)=> {
      const {uName} = req.params;
      const result = await dbAPI.readUserByLikeName(uName);
      res.status(200).send(result);

});

//
//delete button on account.html
//(Requirement 5.3.0) 
//
router.delete('/account/delete/:ULogin', async(req,res)=>{
    const result = await dbAPI.deleteUser(req.params.ULogin);
    res.status(200).send(result);

});

//
//Update user
//(Requirement 5.2.0) 
//
router.put('/account/update/', async(req,res)=>{
    const user = req.body;
    var isValid =true;
    var msg = 
    {
        "Success":"false",
        "Message":""
    }

    //validate user input based 
    var validCheck = dbInputValidation.validate_User_Phone(user.Phone.toString());
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1]  + "- Phone";
    }

    validCheck = dbInputValidation.validate_Address(user.Address);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- Address";
    }

    validCheck = dbInputValidation.validate_City(user.City);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- City";
    }

    validCheck = dbInputValidation.validate_State(user.State);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- State";
    }
 

    validCheck = dbInputValidation.validate_Zip(user.Zip.toString());
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- Zip";
    }

    validCheck = dbInputValidation.validate_User_Email(user.Email);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- Email";
    }

    validCheck = dbInputValidation.validate_User_Belt(user.Belt);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message=validCheck[1] + "- Belt";
    }

    //If data is valid then update AWS DB
    if (isValid){
        const result = await dbAPI.updateUserAll(user);
        msg.Success=result;
        
    }else {
        msg.Success=isValid;
    }
    
    res.send(JSON.stringify(msg));

});

router.get('/account/header/',async (req,res) => {
    let privs = postsession.getSession(req,"privs");

    //wrap in json, since 
    let json = {privs:privs};

    res.send(json);
});

module.exports=router;