//--------------------------------------------
//handles methods on account screen
//--------------------------------------------

import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';

const url =  document.URL ;
const getButton = document.getElementById("submit-user-search");
const inputSearch = document.getElementById("inputsearch");
const table = document.getElementById("accountSearchTable");
const tRowHover = document.getElementById('accountSearchTable');
const saveButton = document.getElementById('input-user-save');
const delButton = document.getElementById('input-user-del');
const inputLogin = document.getElementById("UserLogin");

getButton.addEventListener('click', getInfo);
table.addEventListener('click', loadInfo);
saveButton.addEventListener('click', saveUser);
delButton.addEventListener('click',delUser);

//------------------------------------------------------------------------
//---------------------------FUNCTIONS------------------------------------
//------------------------------------------------------------------------

/* Load header elements for account page */
/* Requirement (5.0.0) */
async function onLoadPage(){
  await displayHeaderElements("account");
}

/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
  logout();
}


/**
 * This function deletes the user that is currenlty shown on the form.
 * If calls the back end delete method. The table above the form is cleared after deletion.
 * (Requirement 5.3.0)
*/
async function delUser (e) {
  e.preventDefault();

  if (inputLogin.value.trim()=="") {
    return;
  }

  const confirmDel = confirm("Do you want to delete - " + inputLogin.value.trim() + " ?")
  if (confirmDel===false) {
    return;
  }
 
  const pageURL =  document.URL  +  "/delete/" + inputLogin.value.trim();

  const res = await fetch(pageURL , 
    {
        method: 'DELETE'
    }      
  )
 
  const formSearch = document.getElementById('frmUser').reset() ;
  const rowCount = table.rows.length;

  for (let i=rowCount;i>1;i--){
    table.deleteRow(i-1);
  }


}

/**
 * The getInfo(e) function is used to search the for all user names with text that
 * contains what is entered by the user.
 * (Requirement 5.1.0) 
*/

async function getInfo (e) {
  e.preventDefault();

    const rowCount = table.rows.length;
    
    for (let i=rowCount;i>1;i--){
      table.deleteRow(i-1);
    }
    
    if (inputSearch.value.trim()=="") {
      return;
    }
    
    const pageURL = document.URL  + "/search/" + inputSearch.value.toUpperCase();
    
    const res = await fetch(pageURL , 
        {
            method: 'GET'

        }      
    )

    var formItem = document.getElementById('frmUser').reset() ;

        const data = await res.json();
        const count = data.count;
        inputSearch.value= "";
        


      //2. Load table using data
      data.Items.forEach((element, index)=>{
        //if (index<5) {

          var row = table.insertRow(1);
          row.classList.add('trhov');
          var cell1 = row.insertCell(0);        
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);
          var cell5 = row.insertCell(4);
          var cell6 = row.insertCell(5);
          var cell7 = row.insertCell(6);
          var cell8 = row.insertCell(7);
              cell8.classList.add('hideCol');
          var cell9 = row.insertCell(8);
              cell9.classList.add('hideCol');
          var cell10 = row.insertCell(9);
              cell10.classList.add('hideCol');
          var cell11 = row.insertCell(10);
              cell11.classList.add('hideCol');
          var cell12 = row.insertCell(11);
              cell12.classList.add('hideCol');



          cell1.innerHTML=element['User_Login'];
          cell2.innerHTML=element['User_Name'];
          cell3.innerHTML=element['User_Email'];
          cell4.innerHTML=element['Address'];
          cell5.innerHTML=element['City'];
          cell6.innerHTML=element['State'];
          cell7.innerHTML=element['User_Phone'];
          cell8.innerHTML=element['Zip'];

          var [mm,dd,yy]=element['Account_Start_Date'].split('/');
          cell9.innerHTML='20' + yy + "-" + mm + '-' + dd;

          cell10.innerHTML=element['Account_Suspended'];
          cell11.innerHTML=element['Administrator'];
          cell12.innerHTML=element['User_Belt'];

        //}
      });
    }

/**
 * The saveUser(e) function saves form input on the accounts page to the database.
 * Data is validated and a put call is made to the backend server.
 * (Requirement 5.2.0) 
*/

  async function saveUser(e) {
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
  
    const formBelt = document.getElementById('belt');
    
    //convert strings to bool for admin and suspended accounts
    const formAdmin = document.getElementById('admin');
    var formAdminBool = false;
    if(formAdmin.value=="TRUE"){
      formAdminBool=true;
    }

    const formSuspend = document.getElementById('suspended');
    var formSuspendBool=false;
    if(formSuspend.value=="TRUE"){
      formSuspendBool=true;
    }

    var [yy,mm,dd]=formStartDate.value.split('-');
    const ADate = mm + '/' + dd + '/' + yy.substring(2,4);
  
    const user = {
                  Name: formName.value.trim(),
                  Login: formLogin.value.trim(),
                  Admin: formAdminBool,
                  StartDate: ADate,
                  Suspended: formSuspendBool,
                  Phone: formPhone.value.trim(),
                  Address: formAddress.value.trim(),
                  City: formCity.value.trim(),
                  State: formState.value,
                  Zip: parseInt(formZip.value.trim()),
                  Email: formEmail.value.trim(),
                  Belt: formBelt.value,
                  };
                  

                  if (user.Name=="" || user.Login=="" ||  
                      user.StartDate=="" || user.Phone=="" || user.Address=="" || 
                      user.City=="" || user.State=="" || user.Email=="" || user.Belt=="") {
                      alert("Please enter a value for each input before saving.");
                      
                  }else {
                      const pageURL =  document.URL  +  "/update/";
                
                      const res = await fetch(pageURL , 
                          {
                              method: 'PUT',
                              headers:{"Content-Type":"application/json"},
                              body : JSON.stringify(user)    
                          }      
                      )
                      
                      const data = await res.json();
        
                      if(data.Success==true){
                            const formUpdate = document.getElementById('frmUser').reset() ;
                            const rowCount = table.rows.length;

                            for (let i=rowCount;i>1;i--){
                              table.deleteRow(i-1);
                            }
                          
                            alert("User created for " + user.Name );
                      }else{
                            alert("Invalid Input \n" + data.Message);
                      }
        
                  }   
  }

/**
 * The loadInfo(e) function takes the information in the accounts table list of users
 * and loads the form below it.
 * (Requirement 5.2.0) 
*/

    async function loadInfo (e) {
      e.preventDefault();
      const rowClicked = e.target.parentNode

      if(rowClicked.childNodes[0].outerText!=="User Login") {
        var formItem = document.getElementById('UserLogin');
        formItem.value=rowClicked.childNodes[0].outerText;

        var formItem = document.getElementById('UserName');
        formItem.value=rowClicked.childNodes[1].outerText;

        var formItem = document.getElementById('emailAddress');
        formItem.value=rowClicked.childNodes[2].outerText;

        var formItem = document.getElementById('address');
        formItem.value=rowClicked.childNodes[3].outerText;

        var formItem = document.getElementById('city');
        formItem.value=rowClicked.childNodes[4].outerText;

        var formItem = document.getElementById('state');
        formItem.value=rowClicked.childNodes[5].outerText;

        var formItem = document.getElementById('phone');
        formItem.value=rowClicked.childNodes[6].outerText;

        var formItem = document.getElementById('zip');
        formItem.value=rowClicked.childNodes[7].outerText;

        var formItem = document.getElementById('startDate');
        formItem.value=rowClicked.childNodes[8].outerText;

        var formItem = document.getElementById('suspended');
        formItem.value=rowClicked.childNodes[9].outerText.toUpperCase();

        var formItem = document.getElementById('admin');
        formItem.value=rowClicked.childNodes[10].outerText.toUpperCase();

        var formItem = document.getElementById('belt');
        formItem.value=rowClicked.childNodes[11].outerText;

      }

    }


//Set scope of methods to window so html documents can access
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;