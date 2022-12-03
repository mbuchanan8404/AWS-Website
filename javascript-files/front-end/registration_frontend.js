//--------------------------------------------
//handles methods on registration screen
//--------------------------------------------

//import { TokenFileWebIdentityCredentials } from 'aws-sdk';
//import { json } from 'body-parser';
//import { json } from 'body-parser';
import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';

const url =  document.URL  ;
const saveButton = document.getElementById('input-user-save');
const clearButton = document.getElementById('input-user-clear');

saveButton.addEventListener('click', saveUser);
clearButton.addEventListener('click',clearForm);


/**
 * The saveUser(e) function saves a new user's
 * registration info and validates input while 
 * calling the Post method.
 *  (Requirement 1.0.0) (Requirement 1.0.1)  (Requirement 1.0.2) (Requirement 1.0.3) 
 *  (Requirement 1.0.4) (Requirement 1.0.5)  (Requirement 1.0.6) (Requirement 1.0.7) 
 *  (Requirement 1.0.8) (Requirement 1.0.9)  (Requirement 1.0.10) (Requirement 1.0.11) 
 *  (Requirement 1.0.12) (Requirement 1.0.13) (Requirement 1.1.0) (Requirement 1.2.0) 
 *  (Requirement 1.3.0) (Requirement 1.4.0)
*/

async function saveUser (e) {
  e.preventDefault();
  


  const formLogin = document.getElementById('UserLogin');

  const formName = document.getElementById('UserName');

  const formEmail = document.getElementById('emailAddress');

  const formAddress = document.getElementById('address');

  const formCity = document.getElementById('city');

  const formState = document.getElementById('state');

  const formPhone = document.getElementById('phone');

  const formZip = document.getElementById('zip');

  const formStartDate = document.getElementById('startDate');

  const formPassword = document.getElementById('UserPass');

  const formQuestion = document.getElementById('question');

  const formAnswer = document.getElementById('answer');

  const formBelt = document.getElementById('belt');
  
  const formAdmin = false;

  const formSuspend = false;

  var [yy,mm,dd]=formStartDate.value.split('-');
  const ADate = mm + '/' + dd + '/' + yy.substring(2,4);

  const user = {
                User_Name: formName.value.trim().toUpperCase(),
                User_Login: formLogin.value.trim(),
                User_Password: formPassword.value.trim(),
                Administrator: formAdmin,
                User_Backup_Question: formQuestion.value,
                User_Backup_Answer: formAnswer.value.trim(),
                User_Balance: 0,
                User_Due_Date: ADate,
                Account_Start_Date: ADate,
                Account_End_Date: ADate,
                Account_Suspended: formSuspend,
                User_Phone: formPhone.value.trim(),
                Address: formAddress.value.trim(),
                City: formCity.value.trim(),
                State: formState.value,
                Zip: parseInt(formZip.value.trim()),
                User_Email: formEmail.value.trim(),
                User_Belt: formBelt.value,
                
               };
               
               if (user.User_Name=="" || user.User_Login=="" || user.User_Password=="" || user.User_Backup_Question=="" || 
                   user.User_Backup_Answer=="" || user.Account_Start_Date=="" || user.User_Phone=="" || user.Address=="" || 
                   user.City=="" || user.State=="" || user.User_Email=="" || user.User_Belt=="") {
                    alert("Please enter a value for each input.");
                    
                }else {
                    const pageURL =  document.URL  + "/create/";
              
                    const res = await fetch(pageURL , 
                        {
                            method: 'POST',
                            headers:{"Content-Type":"application/json"},
                            body : JSON.stringify(user)    
                        }      
                    )
                    
                    const data = await res.json();
                        
                    if(data.Success==true){
                         const formSearch = document.getElementById('frmReg').reset() ;
                         alert("Account created for " + user.User_Name);
                    }else{
                         //alert("Invalid Input \n" + data.Message);
                         alert(data.Message);
                    }

     
                }


               
              

}

async function clearForm (e) {
  e.preventDefault();

  const formSearch = document.getElementById('frmReg').reset() ;

}

/**
 * onLoadPage() triggers whenever the user opens an html document
 * References handler_frontend.js to display the header elements
*/
function onLoadPage(){
    displayHeaderElements("registration");
}

/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
    logout();
}

//Set scope of methods to window so html documents can access
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;