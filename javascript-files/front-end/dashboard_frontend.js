//--------------------------------------------
//handles methods on dashboard screen
//--------------------------------------------

import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';

/**
 * The loadCards function is called on page load to preload 
 * bootstrap cards with belt, user, and event info
 * (Requirement 6.1.0)
*/

async function loadCards () {

    //load randomly selected images to the 3 cards on the dashboard
    var img1 = 0;
    var img2 = 0;
    var img3 = 0;

    while(img1==0 || img2==0 || img3==0) {
        const imgCounter = Math.floor(Math.random() * 8)
        if(img1==0){
            img1=imgCounter+1;
        }else if(img2==0 && img1!==imgCounter+1){
            img2=imgCounter+1;
        }else if(img3==0 && img2!==imgCounter +1  && img1 !==imgCounter+1 ){
            img3=imgCounter+1;
        }
    }

    var imgCard1 = document.getElementById('imgCard1');
    imgCard1.src = './img/dash' + img1 + '.jpg';

    var imgCard2 = document.getElementById('imgCard2');
    imgCard2.src = './img/dash' + img2 + '.jpg';

    var imgCard3 = document.getElementById('imgCard3');
    imgCard3.src = './img/dash' + img3 + '.jpg';


    const pageURL = document.URL  +  "/loadData/";
    
    const res = await fetch(pageURL , 
        {
            method: 'GET',
            headers: { 'Content-Type': 'text/plain' }
        }      
    )
    
    //retrieve user data from db
    const data = await res.text();
    const firstDivision = data.indexOf('%1%');
    const dataUsers = JSON.parse(data.substring(0,firstDivision));
    const dataEvents = JSON.parse( data.substring(firstDivision+3,data.length));
  
    //parse json into object
    var msg = {
        'memberCount': 0,
        'adminCount': 0,
        'userCount': 0,
        'white': 0,
        'yellow': 0,
        'green': 0,
        'blue': 0,
        'red': 0,
        'black': 0,
      }


    msg.memberCount=dataUsers['Count'];
    var dataX = dataUsers.Items;

        for(let i=0;i<msg.memberCount;i++) {
        if(dataX[i]['Administrator']==true){
            msg['adminCount']+=1;
        }else {
            msg['userCount']+=1;
        }

        switch (dataX[i]['User_Belt']) {
            case 'White':
                msg['white']+=1;
                break;
            case 'Yellow':
                msg['yellow']+=1;
                break;
            case 'Green':
                msg['green']+=1;
                break;
            case 'Blue':
                msg['blue']+=1;
                break;
            case 'Red':
                msg['red']+=1;
                break;
            case 'Black':
                msg['black']+=1;
                break;
        }
        }
   
        var cards = document.getElementById('totalMem');
        cards.innerHTML = "Total Members:  " + msg['memberCount'];

        cards = document.getElementById('admin');
        cards.innerHTML = "Administrators:  " + msg['adminCount'];

        cards = document.getElementById('standard');
        cards.innerHTML = "Standard Users:  " + msg['userCount'];

        cards = document.getElementById('white');
        cards.innerHTML = "White:  " + msg['white'];

        cards = document.getElementById('yellow');
        cards.innerHTML = "Yellow:  " + msg['yellow'];

        cards = document.getElementById('green');
        cards.innerHTML = "Green: " + msg['green'];

        cards = document.getElementById('blue');
        cards.innerHTML = "Blue: " + msg['blue'];

        cards = document.getElementById('red');
        cards.innerHTML = "Red: " + msg['red'];

        var cards = document.getElementById('black');
        cards.innerHTML = "Black: " + msg['black'];

    //get events for card
    var dataX = dataEvents.Items;
    var counter = 1;
    

        for(let i=0;i<dataEvents.Count;i++) {
           
                if (counter<4){
                    
                    const eventInfo = document.getElementById('event' + counter );
                    eventInfo.innerHTML = dataX[i]['Event_Date'] + " - " + dataX[i]['Event_Start_Time']   +  " - " + dataX[i]['Event_Title'];

                    counter++;
                }
        }
    
    //load user data into table
    const table = document.getElementById('tableUser');
    const rowCount = table.rows.length;
    
    for (let i=rowCount;i>1;i--){
        table.deleteRow(i-1);
    }
    
    dataUsers.Items.forEach((element, index)=>{

          var row = table.insertRow(1);
          var cell1 = row.insertCell(0);        
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);
          var cell5 = row.insertCell(4);
          var cell6 = row.insertCell(5);
          var cell7 = row.insertCell(6);

          cell1.innerHTML=element['User_Login'];
          cell2.innerHTML=element['User_Name'];
          cell3.innerHTML=element['User_Email'];
          cell4.innerHTML=element['Address'];
          cell5.innerHTML=element['City'];
          cell6.innerHTML=element['State'];
          cell7.innerHTML=element['User_Phone'];
        
      });


    }


/* Load header elements for account page */
/* Requirement (6.0.0) */
function onLoadPage(){
    loadCards();
    displayHeaderElements("dashboard");
}


/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
    logout();
}

//Set scope of methods to window so html documents can access
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;