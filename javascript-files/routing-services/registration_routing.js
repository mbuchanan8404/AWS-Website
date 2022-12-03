
const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const path = require('path');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');
const dbInputValidation = require('../back-end/dbInputValidation');
const postsession = require('../environment/postsession.js');
const dbUserManager = require('../back-end/dbItems/dbItemsManager');

const aes = require('../back-end/encryption/aes.js');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//
//Loads registration page 
//
router.get('/registration',(req,res) => {
    if(!postsession.checkPrivs(req,"registration")){
        res.redirect('/logout');
        return;
    }
    
    res.sendFile('registration.html',{root:page_dir})
});  


/**
 * This routes from the save click from the 
 * registration page
 *  (Requirement 1.0.1)  (Requirement 1.0.2) (Requirement 1.0.3) (Requirement 1.0.4)
 *  (Requirement 1.0.5)  (Requirement 1.0.6) (Requirement 1.0.7) (Requirement 1.0.8)
 *  (Requirement 1.0.9)  (Requirement 1.0.10) (Requirement 1.0.11) (Requirement 1.0.12)
 *  (Requirement 1.0.13) (Requirement 1.1.0) (Requirement 1.2.0) (Requirement 1.3.0)
 *  (Requirement 1.4.0)
*/
router.post('/registration/create/',async(req,res)=> {
        const user = req.body;
        var isValid =true;

        var msg = 
        {
            "Success":"false",
            "Message":""
        }

        //determine if user trying to signup is already a user
        var isUser = await dbUserManager.readUserByLogin(user.User_Login);

        if(isUser.Count == 1){
            
            msg.Success=false;
            msg.Message=user.User_Login+" is already taken!";
            res.send(JSON.stringify(msg));
            return;
        }



        //create array to save
        const a01Name = user.User_Name;
        const a02Login = user.User_Login;
        const a03Pass = user.User_Password;
        const a04Admin = user.Administrator;
        const a05Question = user.User_Backup_Question;
        const a06Answer = user.User_Backup_Answer;
        const a07Balance= 0;
        const a08Due = user.User_Due_Date;
        const a09Start = user.Account_Start_Date;
        const a10End = user.Account_End_Date;
        const a11Suspend = user.Account_Suspended;
        const a12Phone = user.User_Phone;
        const a13Address = user.Address;
        const a14City = user.City;
        const a15State = user.State;
        const a16Zip = user.Zip;
        const a17Email = user.User_Email;
        const a18Belt = user.User_Belt;

               var userCreate = [ 
                     a01Name, a02Login, a03Pass, a04Admin, a05Question, a06Answer, a07Balance, a08Due,
                     a09Start, a10End, a11Suspend, a12Phone, a13Address, a14City, a15State, a16Zip, a17Email, a18Belt,
                ];

    //validate inputs
    var validCheck = dbInputValidation.validate_User_Name(a01Name);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Name\n";
    }

    validCheck = dbInputValidation.validate_User_Login(a02Login);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Login\n";
    }

    validCheck = dbInputValidation.validate_User_Password(a03Pass);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Password\n";
    }

    //ENCRYPT THE PASSWORD AT THIS POINT
    //change userCreate password to encrypted password
    userCreate[2] = aes.encrypt(a03Pass);

    validCheck = dbInputValidation.validate_Backup_Answer(a06Answer);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Recovery Answer\n";
    }

    validCheck = dbInputValidation.validate_User_Phone(a12Phone.toString());
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1]  + "- Phone\n";
    }

    validCheck = dbInputValidation.validate_Address(a13Address);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Address\n";
    }

    validCheck = dbInputValidation.validate_City(a14City);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- City\n";
    }

    validCheck = dbInputValidation.validate_State(a15State);
    if( validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- State\n";
    }

    if(a16Zip != null){
        validCheck = dbInputValidation.validate_Zip(a16Zip.toString());
        if(validCheck != null && validCheck[0]==false){
            isValid=false;
            msg.Message+=validCheck[1] + "- Zip\n";
        }
    }
    else{
        isValid=false;
    }

    validCheck = dbInputValidation.validate_User_Email(a17Email);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Email\n";
    }

    validCheck = dbInputValidation.validate_User_Belt(a18Belt);
    if(validCheck[0]==false){
        isValid=false;
        msg.Message+=validCheck[1] + "- Belt\n";
    }


    if (isValid){
        //If valid then save new user to db
        const result = await dbUserManager.createUser(userCreate);
        msg.Success=result;
        
    }else {
        msg.Success=isValid;

    }

    res.send(JSON.stringify(msg));
    
});

//validate user credentials and load user data to session
router.get('/registration/header/',async (req,res) => {
    let privs = postsession.getSession(req,"privs");

    //wrap in json, since 
    let json = {privs:privs};

    res.send(json);
});

module.exports=router;