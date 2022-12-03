///////////////////////////////////////////////////////////////////////////////////////
 /////////////////////////// Event Management Interface ///////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module dynamically generates the event page forms and tables to 
   create and delete events and send event invites to users. */


/*  Requirements
    7.1.0
    7.2.0
    7.3.0
    7.4.0
    7.5.0  
*/


import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';


/* Keep a global copy of the user list, event list, and invite list. */
var userList = {Items:[],Count:0};
var eventList = {Items:[],Count:0};
var inviteList = {Items:[],Count:0};


/* Variable to store which boxes are checked in the user list */
var checkedUsers = [];


/* Variables for keeping track of sort direction for column headers in event list */
var titleSort = false;
var descriptionSort = false;
var startTimeSort = false;
var endTimeSort = false;
var dateSort = false;
var cancelledSort = false;


/* Variables for keeping track of sort direction for column headers in user list */
var checkAll = false;
var nameSort = false;
var loginSort = false;
var beltSort = false;
var suspendedSort = false;


/* Function for on page load build event list, user list, and event form */
/* Requirement (7.0.0) */
async function onLoadPage() {
  await displayHeaderElements("calendar");
  await getEvents();
  buildEventList();
  buildEventForm();
  await getUsers();
  buildUserList();
}

/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
  logout();
}


//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Begin Event List Functions /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


/* Function to get all events from the database for the event list */
async function getEvents() {
  eventList = {Items:[],Count:0};
  const pageURL = document.URL + '/getEventList';
  const res = await fetch(pageURL,{method:'GET'});
  let result = await res.json();
  eventList.Items.push(...result.Items);
  eventList.Count = result.Count;
}


/* Function to build the table to display the list of events */
/* (Requirement 7.1.0) */
function buildEventList() {
  // Get the div element for the event list from the html page
  let events = document.getElementById('eventList');

  // Get the selected row if there was one so we can re-select it after user presses a sort header button
  let previouslySelectedEventRow = document.getElementsByClassName('selectedEventRow');
  if(previouslySelectedEventRow.length > 0) {
    previouslySelectedEventRow = previouslySelectedEventRow[0].getAttribute("name");
  }
  else {
    previouslySelectedEventRow = -1;
  }

  // Variable to hold the dynamically generated table
  let dynamicEventTable = '';

  // First generate the events table header
  dynamicEventTable += '<table id = eventTable>';
  dynamicEventTable += '<thead>' +
    '<th id="EventTitle">Title</th>' + 
    '<th id="Description">Description</th>' + 
    '<th id="Start Time">Start Time</th>' +
    '<th id="End Time">End Time</th>' +
    '<th id="Date">Date</th>' +
    '<th id="Cancelled">Cancelled</th> ' +
    '</thead>';
  
  // populate the events table with events
  for(let e = 0; e < eventList.Items.length; e++) {
    dynamicEventTable += '<tr name="' + eventList.Items[e].Event_Title + '">';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_Title + '</td>';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_Description + '</td>';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_Start_Time + '</td>';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_End_Time + '</td>';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_Date + '</td>';
    dynamicEventTable += '<td name="' + eventList.Items[e].Event_Title + '">' + eventList.Items[e].Event_Cancelled + '</td>';
    dynamicEventTable += '</tr>';
  }

  // Send the html to the browser
  dynamicEventTable += '</table>';
  events.innerHTML = dynamicEventTable;

  // Add event listeners for the column headers
  let sortButtons = events.querySelectorAll('th');
  for(let b = 0; b < sortButtons.length; b++) {
    sortButtons[b].addEventListener("click",sortEventList);
  }

  // Add event listeners for the table rows
  let eventRows = events.querySelectorAll('tr');
  for(let r = 0; r < eventRows.length; r++) {
    let rowCells = eventRows[r].querySelectorAll('td');
    for(let c = 0; c < rowCells.length; c++) {
      rowCells[c].addEventListener("click", eventRowClicked);
    }
  }

  // Re-select the row that was previously selected, if there was one
  if(previouslySelectedEventRow != -1) {
    let rows = events.querySelectorAll('tr');
    for(let i = 0; i < rows.length; i++) {
      if(rows[i].getAttribute('name') == previouslySelectedEventRow) {
        rows[i].classList.add('selectedEventRow');
        break;
      }
    }
  }
}


/* Function to handle user clicking a row in event table */
async function eventRowClicked(e) {
  // We're going to check-mark all users who are invited to the event in the clicked row, so uncheck all users in preparation
  let ul = document.getElementsByName('userCheck');
  for(let i = 0; i < ul.length; i++) {
    ul[i].checked = false;
    if(ul[i].parentElement.parentElement.classList.contains('selectedUser')) {
      ul[i].parentElement.parentElement.classList.remove('selectedUser');
    }
  }
  let userCheckAllHeader = document.getElementById('inviteAllUsersCheckbox');
  userCheckAllHeader.classList.remove('userCheckAll');
  checkAll = false;

  // If the user is clicking an already clicked row, deselect/declick that row and clear the form data from the event
  let currentRow = document.getElementsByClassName('selectedEventRow');
  if(currentRow.length > 0) {
    buildEventForm();
    currentRow = currentRow[0];
    if(currentRow.getAttribute("name") == this.getAttribute("name")) {
      currentRow.classList.remove('selectedEventRow');
      return;
    }
  }
  
  // Mark the row as selected by adding a class and removing that class from any other row
  let et = document.getElementById('eventTable');
  let etRows = et.querySelectorAll('tr');
  for(let i = 0; i < etRows.length; i++) {
    if(etRows[i].getAttribute("name") == this.getAttribute("name")) {
      etRows[i].classList.add('selectedEventRow');
    }
    else{
      etRows[i].classList.remove('selectedEventRow');
    }
  }
  let event = {Item:[]};
  // Fill out the event form with the selected event's fields
  for(let i = 0; i < eventList.Count; i++) {
    if(eventList.Items[i].Event_Title == this.getAttribute("name")) {
      event = eventList.Items[i];
      break; // we found the event, no use continuing
    }
  }
  if(event == {Item:[]}) {
    alert("Event is no longer present in database, refresh page and try again");
    return;
  }

  // Check-mark all users who were invited to the event in the user list
  let invites = await getInviteList(event.S_Key); // Get invites from db for the event
  if(invites.Count == 0) {
    return;
  }
  let usersInvitedToEvent = [];
  for(let i = 0; i < userList.Count; i++) {
    for(let j = 0; j < invites.Count; j++) {
      if(userList.Items[i].P_Key == invites.Items[j].P_Key) {
        usersInvitedToEvent.push(userList.Items[i].User_Login);
      }
    }
  }

  for(let i = 0; i < usersInvitedToEvent.length; i++) {
    for(let j = 0; j < ul.length; j++) {
      if(usersInvitedToEvent[i] == ul[j].id) {
        ul[j].checked = true;
        if(!ul[j].parentElement.parentElement.classList.contains('selectedUser')) {
          ul[j].parentElement.parentElement.classList.add('selectedUser');
        }
      }
    }
  }

  // If we checked every user for the event invites...
  let allChecked = true;
  for(let i = 0; i < ul.length; i++) {
    if(ul[i].checked == false) {
      allChecked = false;
      break;
    }
  }
  // ...we need to set the userCheckAll header and checkAll = true
  if(allChecked) {
    checkAll = true;
    userCheckAllHeader.classList.add('userCheckAll');
  }

  document.getElementById('Event_Title').value = event.Event_Title;
  document.getElementById('Event_Description').value = event.Event_Description;
  document.getElementById('Event_Start_Time').value = convertTimeStampBack(event.Event_Start_Time);
  document.getElementById('Event_End_Time').value = convertTimeStampBack(event.Event_End_Time);
  document.getElementById('Event_Date').value = convertDateStampBack(event.Event_Date);
  document.getElementById('Event_Address').value = event.Address;
  document.getElementById('Event_City').value = event.City;
  document.getElementById('Event_State').value = event.State;
  document.getElementById('Event_Zip').value = event.Zip;

  // Finally, fill in the message field with the message from the invites
  document.getElementById('Invite_Message').value = "--";
  document.getElementById('Invite_Message').value = invites.Items[0].Message;
}


/* Function to get all event invites from the database for the selected event in the event list */
async function getInviteList(sKey) {
  inviteList = {Items:[],Count:0};
  const pageURL = document.URL + '/getInviteList';
  const res = await fetch(pageURL,{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify({b:sKey})});
  let result = await res.json();
  inviteList.Items.push(...result.Items);
  inviteList.Count = result.Count;
  return inviteList;
}



//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////// Begin Event Creation Form Functions ////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


/* Function to build the event creation form */
function buildEventForm() {
  // Variable to hold the dynamically generated forms
  let dynamicForm = '';

  // Get the div element for the event Creation form from the html page
  let eventForm = document.getElementById('eventForm');

  dynamicForm += '<label for="Invite_Message">Invite Message</label>';
  dynamicForm += '<textarea rows=4 id="Invite_Message" name="Invite_Message" required placeholder="message..."></textarea>'
  
  dynamicForm += '<label for="Event_Title">Event Title</label>';
  dynamicForm += '<input type="text" id="Event_Title" name="Event_Title" required>';
  
  dynamicForm += '<label for="Event_Desciption">Event Description</label>';
  dynamicForm += '<input type="text" id="Event_Description" name="Event_Description" required>';

  dynamicForm += '<label for="Event_Start_Time">Event Start Time</label>';
  dynamicForm += '<input type="time" id="Event_Start_Time" name="Event_Start_Time" required>'; 

  dynamicForm += '<label for="Event_End_Time">Event End Time</label>';
  dynamicForm += '<input type="time" id="Event_End_Time" name="Event_End_Time" required>'; 

  dynamicForm += '<label for="Event_Date">Event Date</label>';
  dynamicForm += '<input type="date" id="Event_Date" name="Event_Date" required>';

  dynamicForm += '<label for="Event_Address">Address</label>';
  dynamicForm += '<input type="text" id="Event_Address" name="Event_Address" required>'; 

  dynamicForm += '<label for="Event_City">City</label>';
  dynamicForm += '<input type="text" id="Event_City" name="Event_City" required>';

  dynamicForm += '<label for="Event_State">State</label>';
  dynamicForm += '<input type="text" id="Event_State" name="Event_State" required>'; 

  dynamicForm += '<label for="Event_Zip">ZIP</label>';
  dynamicForm += '<input type="text" id="Event_Zip" name="Event_Zip" required maxlength="5" minlength="5">';

  dynamicForm += '<div id="formButtons">'
  dynamicForm += '<button id="createEventButton">Create Event</button>';
  dynamicForm += '<button id="modifyEventButton">Modify Event</button>';
  dynamicForm += '<button id="clearEventFormButton">Reset Form</button>';
  dynamicForm += '<button id="deleteEventButton">Delete Event</button>';
  dynamicForm += '</div>';

  // Update the page with the dynamically generated event creation form
  eventForm.innerHTML = dynamicForm;

  // Add event listeners to the buttons
  document.getElementById('createEventButton').addEventListener('click',createNewEvent);
  document.getElementById('clearEventFormButton').addEventListener('click',clearEverything);
  document.getElementById('deleteEventButton').addEventListener('click',deleteEvent);
  document.getElementById('modifyEventButton').addEventListener('click',modifyEvent);
}


/* Function to handle the user clicking the Reset Form button: clear any selected rows,
   uncheck any invited users, and rebuild the event form */
async function clearEverything() {
  // Deselect/declick any currently selectetd row in the event list
  let currentRow = document.getElementsByClassName('selectedEventRow');
  if(currentRow.length > 0) {
    currentRow = currentRow[0];
    currentRow.classList.remove('selectedEventRow');
  }
  
  // Uncheck all users
  let ul = document.getElementsByName('userCheck');
  for(let i = 0; i < ul.length; i++) {
    ul[i].checked = false;
    ul[i].parentElement.parentElement.classList.remove('selectedUser');
  }
  let userCheckAllHeader = document.getElementById('inviteAllUsersCheckbox');
  userCheckAllHeader.classList.remove('userCheckAll');
  checkAll = false;

  // Rebuild the event list
  buildEventList();

  // Rebuild event form
  buildEventForm();

  // Rebuild the user list
  buildUserList();
}


/* Function to modify an existing event */
// Since updating all the event invites will make too many requests to the database, 
// we'll just delete the event and recreate it with batchWrite().
/* (Requirement 7.3.0) */
async function modifyEvent() {
  // First check the form inputs to see if the event parameters are present
  if(false == checkFormInputs()) {
    return;
  }
  // Now send the parameters to the database so the dbInputValidator can check them
  const pageURL = document.URL + '/checkEventInputs/';
  let b = {
    Event_Title: document.getElementById('Event_Title').value,
    Event_Description: document.getElementById('Event_Description').value,
    Event_Start_Time: convertTimeStamp(document.getElementById('Event_Start_Time').value),
    Event_End_Time: convertTimeStamp(document.getElementById('Event_End_Time').value),
    Event_Date: convertDateStamp(document.getElementById('Event_Date').value),
    Event_Address: document.getElementById('Event_Address').value,
    Event_City: document.getElementById('Event_City').value,
    Event_State: document.getElementById('Event_State').value,
    Event_Zip: document.getElementById('Event_Zip').value
  };
  const result = await fetch(pageURL,{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify(b)});
  let r = await result.json();
  if(r.message != "Success") { // If the event inputs didn't pass dbInputValidator() in database, display errors and return
    alert(r.message);
    return;
  }
  // The event parameters are good and the event creation will succeed, safe to delete old event
  if(await deleteEvent()) {
    // Now create the new event
    if(await createNewEvent()) {
      //buildEventList();
      alert("Event Modified Successfully");
      return;
    }
  }
  alert("Event Update Unsucessful");
}


/* Function to delete the selected event and all event invites for the event */
/* (Requirement 7.4.0) */
async function deleteEvent(modify) {
  let eventToDelete = document.getElementsByClassName('selectedEventRow');
  if(eventToDelete.length == 0) {
    alert('There is no event selected to delete');
    return false;
  }
  eventToDelete = eventToDelete[0].getAttribute("name");
  let b = {eventToDelete};
  const pageURL = document.URL + '/deleteEvent/';
  const result = await fetch(pageURL,{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify(b)});
  let r = await result.json();
  if(modify == undefined) { // we're modifying an event by deleting then recreating, don't redraw anything yet
    return true;
  }
  await getEvents();
  clearEverything();
  buildEventForm();
  buildEventList();
  alert(r.message);
}


/* Function to create a new event from user input, then create any event invites requested */
/* (Requirement 7.2.0) */
async function createNewEvent(modify) {
  const pageURL = document.URL + '/createEvent/';
  // Construct the post request body
  let b = checkFormInputs();
  if(b == false) {
    return false;
  }
  // Make the actual post request to create the event
  const result = await fetch(pageURL,{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify(b)});
  let r = await result.json(); 
  if(r.message == 'Success') {
    await getEvents(); // We need the Keys for the new event from the database
    // Now create the event invites for the event
    await createEventInvites();
    // Finally, display the newly created event as highlighted with it's invited users check marked
    document.getElementsByClassName('selectedEventRow')[0].classList.remove('selectedEventRow');
    buildEventList();
    document.getElementsByName(b.Event_Title)[0].classList.add('selectedEventRow');
    document.getElementsByName(b.Event_Title)[0].scrollIntoView(); // scroll the time sheet to the new event automatically
    // Check if the event listener for the create new event button is what called this function
    if(modify == undefined){ // If this function was called as part of modifyEvent(), return true
      return true;
    }
  }
  alert(r.message); // event creation failed, notify user of why
  return false;
}


/* Function to create event invites for selected users */
async function createEventInvites() {
  let eventFromInvites = document.getElementById('Event_Title').value;
  let eventFromInvitesKey;
  for(let i = 0; i < eventList.Count; i++) {
    if(eventList.Items[i].Event_Title == eventFromInvites) {
      eventFromInvitesKey = eventList.Items[i].P_Key;
      break;
    }
  }

  // Get all users with checks marks signifying they're invited to the event
  let usersToInvite = document.getElementsByName('userCheck');
  let u = [];
  for(let i = 0; i < usersToInvite.length; i++) {
    if(usersToInvite[i].checked) {
      u.push(usersToInvite[i].id);
    }
  }
  usersToInvite = u;
  let v = []
  for(let i = 0; i < usersToInvite.length; i++) {
    for(let j = 0; j < userList.Count; j++) {
      if(usersToInvite[i] == userList.Items[j].User_Login) {
        v.push(userList.Items[j].P_Key);
      }
    }
  }

  // Get ready to batch write the invites by building up the batch
  usersToInvite = v;
  let batchWriteObject = {Items:[],Count:0};
  if(document.getElementById('Invite_Message').value == '') {
    document.getElementById('Invite_Message').value = "--"; // use the default message if field is blank
  }
  for(let i = 0; i < usersToInvite.length; i++) {
    var item = {
                P_Key:usersToInvite[i],
                S_Key:eventFromInvitesKey, 
                Message:document.getElementById('Invite_Message').value,
                Event_Title:eventFromInvites
              };
    batchWriteObject.Items.push(item);
    batchWriteObject.Count += 1;
  }

  // Make the actual post request to create the event invites
  const pageURL = document.URL + '/createEventInvites/';
  let b = batchWriteObject;
  const result = await fetch(pageURL,{method:'POST', headers:{"Content-Type":"application/json"}, body:JSON.stringify(b)});
  let r = await result.json();
}


/* Function to check event form inputs for validity before creating event */
function checkFormInputs() {
  // First capture the inputs from the fields in the event form
  let b = {
    Event_Title: document.getElementById('Event_Title').value,
    Event_Description: document.getElementById('Event_Description').value,
    Event_Start_Time: convertTimeStamp(document.getElementById('Event_Start_Time').value),
    Event_End_Time: convertTimeStamp(document.getElementById('Event_End_Time').value),
    Event_Date: convertDateStamp(document.getElementById('Event_Date').value),
    Event_Address: document.getElementById('Event_Address').value,
    Event_City: document.getElementById('Event_City').value,
    Event_State: document.getElementById('Event_State').value,
    Event_Zip: document.getElementById('Event_Zip').value
  };

  // Make sure all required fields are present in body
  if(b.Event_Title == '' ||
    b.Event_Description == '' ||
    b.Event_Start_Time == '' ||
    b.Event_End_Time == '' ||
    b.Event_Date == '' ||
    b.Event_Address == '' ||
    b.Event_City == '' ||
    b.Event_State == '' ||
    b.Event_Zip == ''
    ) {
    alert("All fields are required");
    return false;
  }

  // Perform integrity checks
  // Event must be for present or future date and time
  // First compare dates
  let today = getCurrentDate();
  if(compareDateStamps(today, b.Event_Date)) {
    alert("Event cannot start in the past");
    return false;
  }
  // Date for event is >= current date, handle if event date is current day
  if(areDateStampsEqual(today, b.Event_Date)) {
    if(compareTimeStamps(getCurrentTime(), b.Event_Start_Time) || areTimeStampsEqual(getCurrentTime(), b.Event_Start_Time)) {
      alert("Event must be at least one minute in future");
      return false;
    }
  }
  // Event start time must be earlier than event end time
  if(compareTimeStamps(b.Event_Start_Time, b.Event_End_Time)) {
    alert("Event cannot finish before it has started");
    return false;
  }
  return b;
}


//////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Begin User List Functions /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


/* Function to get all users for the user invite list */
async function getUsers() {
  userList = {Items:[],Count:0};
  const pageURL = document.URL + '/getUsers/';
  const res = await fetch(pageURL,{method:'GET'});
  let result = await res.json();
  userList.Items.push(...result.Items);
  userList.Count = result.Count;
}


/* Function to build the table to display the list of users */
function buildUserList() {
  // Store the currently checked user's id's so we can re-check them after rebuilding the userList Table
  let cu = document.getElementsByName('userCheck');
  let cuFinal = [];
  for(let i = 0; i < cu.length; i++) {
    if(cu[i].checked) {
      cuFinal.push(cu[i].id);
    }
  }
  checkedUsers = cuFinal;

  // Get the div element for the user list from the html page
  let users = document.getElementById('userList');
  
  // Variable to hold the dynamically generated html for the user table
  let dynamicUserTable = '';

  dynamicUserTable += '<table id = userTable>';
  dynamicUserTable += '<thead><th id="inviteAllUsersCheckbox">Invite</th>' +
    '<th>User Name</th>' +
    '<th>User Login</th>' +
    '<th>User Belt</th>' +
    '<th>Suspended?</th></thead>';

  for(let u in userList.Items) {
    dynamicUserTable += '<tr><td><input id="' + userList.Items[u].User_Login + '" name="userCheck" class="check" type="checkbox"></td>';
    dynamicUserTable += '<td>' + userList.Items[u].User_Name + '</td>';
    dynamicUserTable += '<td>' + userList.Items[u].User_Login + '</td>';
    dynamicUserTable += '<td>' + userList.Items[u].User_Belt + '</td>';
    dynamicUserTable += '<td>' + userList.Items[u].Account_Suspended + '</td>';
    dynamicUserTable += '</tr>';
  }

  dynamicUserTable += '</table>';
  users.innerHTML = dynamicUserTable;

  // Add event listener for the invite all users checkbox
  document.getElementById('inviteAllUsersCheckbox').addEventListener("click", inviteAllUsers);

  // Add event listeners for the column header sort buttons
  let sortButtons = users.querySelectorAll('th');
  for(let buttonCounter = 1; buttonCounter < sortButtons.length; buttonCounter++) {
    sortButtons[buttonCounter].addEventListener("click",sortUserList);
  }

  // Add event listeners for the table rows
  let userRows = users.querySelectorAll('tr');
  for(let row = 1; row < userRows.length; row++) {
    let rowCells = userRows[row].querySelectorAll('td');
    for(let column = 0; column < rowCells.length; column++) {
      rowCells[column].addEventListener("click",userRowClicked);
      rowCells[column].id = row - 1;
    }
  }

  // Call the function to re-check all previously checked user rows
  remarkUserCheckBoxes();

  // Finally, remark the check all box if needed
  if(checkAll) {
    document.getElementById('inviteAllUsersCheckbox').classList.add('userCheckAll');
  }
  else {
    document.getElementById('inviteAllUsersCheckbox').classList.remove('userCheckAll');
  }
}


/* Function to re-mark all check boxes after a user table sort header button is pressed */
function remarkUserCheckBoxes() {
  let userList = document.getElementsByName('userCheck');
  for(let i = 0; i < checkedUsers.length; i++) {
    for(let j = 0; j < userList.length; j++) {
      if(checkedUsers[i] == userList[j].id) {
        userList[j].checked = true;
        userList[j].parentElement.parentElement.classList.add('selectedUser');
      }
    }
  }
}


/* Function to mark all users as invited/uninvited */
/* (Requirement 7.2.0) */
function inviteAllUsers(e) {
  checkAll = !checkAll;
  let userCheckBoxes = document.getElementsByName('userCheck');
  for(let i = 0; i < userCheckBoxes.length; i++) {
    if(checkAll) {
      userCheckBoxes[i].parentElement.parentElement.classList.add('selectedUser');
      userCheckBoxes[i].checked = true;     
    }
    else {
      userCheckBoxes[i].parentElement.parentElement.classList.remove('selectedUser');
      userCheckBoxes[i].checked = false;
    }
  }
  document.getElementById('inviteAllUsersCheckbox').classList.toggle('userCheckAll');
}


/* Function to handle a row being clicked in the user table */ 
function userRowClicked(e) {
  if(this.parentElement.classList.contains('selectedUser')) {
    this.parentElement.classList.remove('selectedUser');
  }
  else {
    this.parentElement.classList.add('selectedUser');
  }
  let selectedRowNumber = this.id;
  let userCheckList = document.getElementsByName('userCheck');
  // We must handle the checkbox itself being clicked rather than the row to avoid double toggling
  if(e.target.name != 'userCheck'){
    userCheckList[selectedRowNumber].checked = !userCheckList[selectedRowNumber].checked;
  }
  // If we're unchecking a row, then invite all must be set to false
  if(checkAll && userCheckList[selectedRowNumber].checked == false) {
    checkAll = false;
    document.getElementById('inviteAllUsersCheckbox').classList.remove('userCheckAll');
  }

  // If we're checking the last unchecked row, then invite all must be set true
  else if(!checkAll) {
    let userRows = document.getElementsByName('userCheck');
    for(let i = 0; i < userRows.length; i++) {
      if(userRows[i].checked == false) {
        checkAll = false;
        return; // There are unchecked rows, go ahead and return without setting checkall
      }
    }
    checkAll = true;
    document.getElementById('inviteAllUsersCheckbox').classList.add('userCheckAll');
  }
}


//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Begin Header Sort Functions ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


/* Function to sort the event list by column header */
/* (Requirement 7.5.0) */
function sortEventList(e) {
  let attr = e.target.innerHTML;
  // Sort events based on Event_Title 
  if(attr == 'Title') {
    if(!titleSort) {
      titleSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Title >= eventList.Items[j].Event_Title) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      titleSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Title.toUpperCase() <= eventList.Items[j].Event_Title.toUpperCase()) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort events based on Event_Description
  else if(attr == 'Description') {
    if(!descriptionSort) {
      descriptionSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Description.toUpperCase() >= eventList.Items[j].Event_Description.toUpperCase()) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      descriptionSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Description.toUpperCase() <= eventList.Items[j].Event_Description.toUpperCase()) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort events based on Event_Start_Time
  else if(attr == 'Start Time') {
    if(!startTimeSort) {
      startTimeSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(compareTimeStamps(eventList.Items[i].Event_Start_Time, eventList.Items[j].Event_Start_Time) ||
            areTimeStampsEqual(eventList.Items[i].Event_Start_Time, eventList.Items[j].Event_Start_Time)) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      startTimeSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(!compareTimeStamps(eventList.Items[i].Event_Start_Time, eventList.Items[j].Event_Start_Time) ||
            areTimeStampsEqual(eventList.Items[i].Event_Start_Time, eventList.Items[j].Event_Start_Time)) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort events based on Event_End_Time
  else if(attr == 'End Time') {
    if(!endTimeSort) {
      endTimeSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(compareTimeStamps(eventList.Items[i].Event_End_Time, eventList.Items[j].Event_End_Time) ||
            areTimeStampsEqual(eventList.Items[i].Event_End_Time, eventList.Items[j].Event_End_Time)) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      endTimeSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(!compareTimeStamps(eventList.Items[i].Event_End_Time, eventList.Items[j].Event_End_Time) ||
            areTimeStampsEqual(eventList.Items[i].Event_End_Time, eventList.Items[j].Event_End_Time)) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort events based on Event_Date 
  else if(attr == 'Date') {
    if(!dateSort) {
      dateSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(compareDateStamps(eventList.Items[i].Event_Date, eventList.Items[j].Event_Date) ||
            areDateStampsEqual(eventList.Items[i].Event_Date, eventList.Items[j].Event_Date)) {
              let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      dateSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(!compareDateStamps(eventList.Items[i].Event_Date, eventList.Items[j].Event_Date) ||
            areDateStampsEqual(eventList.Items[i].Event_Date, eventList.Items[j].Event_Date)) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort events based on Event_Cancelled
  else if(attr == 'Cancelled') {
    if(!cancelledSort) {
      cancelledSort = true;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Cancelled >= eventList.Items[j].Event_Cancelled) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
    else {
      cancelledSort = false;
      for(let i = 0; i < eventList.Count; i++) {
        for(let j = i + 1; j < eventList.Count; j++) {
          if(eventList.Items[i].Event_Cancelled <= eventList.Items[j].Event_Cancelled) {
            let temp = eventList.Items[i];
            eventList.Items[i] = eventList.Items[j];
            eventList.Items[j] = temp;
          }
        }
      }
    }
  }
  buildEventList();

  // Mark the proper sort header
  let eventListHeaders = document.getElementById('eventTable');
  let headers = eventListHeaders.querySelectorAll('th');
  for(let i = 0; i < headers.length; i++) {
    if(headers[i].innerHTML == this.innerHTML) {
      headers[i].classList.add('eventSortHeader');
    }
    else {
      headers[i].classList.remove('eventSortHeader');
    }
  }
}


/* Function to sort the user list by column header */
/* (Requirement 7.5.0) */
function sortUserList(u) {
  // First store any currently selected users so we can reselect them at the very end of the sort
  let attr = u.target.innerHTML;
  // Sort users based on User_Name
  if(attr == 'User Name') {
    if(!nameSort) {
      nameSort = true;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Name.toUpperCase() >= userList.Items[j].User_Name.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
    else {
      nameSort = false;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Name.toUpperCase() <= userList.Items[j].User_Name.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort users based on User_Login 
  else if(attr == 'User Login') {
    if(!loginSort) {
      loginSort = true;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Login.toUpperCase() >= userList.Items[j].User_Login.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
    else {
      loginSort = false;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Login.toUpperCase() <= userList.Items[j].User_Login.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort users based on User_Belt
  else if(attr == 'User Belt') {
    if(!beltSort) {
      beltSort = true;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Belt.toUpperCase() >= userList.Items[j].User_Belt.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
    else {
      beltSort = false;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].User_Belt.toUpperCase() <= userList.Items[j].User_Belt.toUpperCase()) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
  }
  // Sort users based on Account_Suspended
  else if(attr == 'Suspended?') {
    if(!suspendedSort) {
      suspendedSort = true;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].Account_Suspended >= userList.Items[j].Account_Suspended) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
    else {
      suspendedSort = false;
      for(let i = 0; i < userList.Count; i++) {
        for(let j = i + 1; j < userList.Count; j++) {
          if(userList.Items[i].Account_Suspended <= userList.Items[j].Account_Suspended) {
            let temp = userList.Items[i];
            userList.Items[i] = userList.Items[j];
            userList.Items[j] = temp;
          }
        }
      }
    }
  }
  buildUserList();

  // Mark the proper sort header
  let userListHeaders = document.getElementById('userTable');
  let headers = userListHeaders.querySelectorAll('th');
  for(let i = 1; i < headers.length; i++) {
    if(headers[i].innerHTML == this.innerHTML) {
      headers[i].classList.add('userSortHeader');
    }
    else {
      headers[i].classList.remove('userSortHeader');
    }
  }
}


/* Function to compare two datestamps from the database in format 'mm/dd/yyyy', finds if d1 > d2 */
function compareDateStamps(d1, d2) {
  let month1 = '', month2 = '', day1 = '', day2 = '', year1 = '', year2 = '';
  year1 = d1.split('/')[2];
  year2 = d2.split('/')[2];

  // First compare years
  if(year1 > year2) {
    return true;
  }
  else if(year1 < year2){
    return false;
  }

  // The two dates have the same year value, compare month values
  month1 = d1.split('/')[0];
  month2 = d2.split('/')[0];
  if(month1 > month2) {
    return true;
  }
  else if(month1 < month2) {
    return false;
  }

  // The two dates have the same year value AND month value, compare day values
  day1 = d1.split('/')[1];
  day2 = d2.split('/')[1];
  if(day1 > day2) {
    return true;
  }
  else {
    return false;
  }
}


/* Function to compare two datestamps for equality d1 == d2 */
function areDateStampsEqual(d1, d2) {
  if(!compareDateStamps(d1, d2) && !compareDateStamps(d2, d1)) { // if d1 !> d2 and d2 !> d1 then d1 == d2
      return true;
  }
  else {
      return false;
  }
}


/* Function to convert datestamp from 'yyyy-mm-dd' format to 'mm/dd/yyyy' format for database */
function convertDateStamp(d) {
// Change date format for database
  let dateTemp = d.split("-");
  return dateTemp[1] + '/' + dateTemp[2] + '/' + dateTemp[0];
} 


/* Function to convert datestamp from 'mm/dd/yyyy' format back to 'yyyy-mm-dd' format */
function convertDateStampBack(d) {
  let dateTemp = d.split('/');
  return dateTemp[2] + '-' + dateTemp[0] + '-' + dateTemp[1];
}


/* Function to get the current date in mm/dd/yyyy format */
function getCurrentDate() {
  let date = new Date();
  let month = date.getMonth() + 1;
  if(month < 10) {
    month = '0' + month;
  }
  let day = date.getDate();
  if(day < 10) {
    day = '0' + day;
  }
  let year = date.getFullYear();
  let currentDate = month + '/' + day + '/' + year;
  return currentDate;  
}


/* Function to compare two timestamps from the database in format '09:30 AM', finds if t1 > t2 */
function compareTimeStamps(t1, t2) {
  let temp1 = '', temp2 = '', t1Meridian = '', t2Meridian = '', t1Hour = '', t2Hour = '', t1Minute = '', t2Minute = '';
  t1Meridian = t1.split(' ')[1];
  t2Meridian = t2.split(' ')[1];

  // First compare AM/PM values
  if(t1Meridian > t2Meridian) {
    return true;
  }
  else if(t1Meridian < t2Meridian) {
    return false;
  }

  // The two times have the same AM/PM value, compare hour values
  t1Hour = t1.split(':')[0];
  t2Hour = t2.split(':')[0];
  if((t1Hour % 12) > (t2Hour % 12)) {
    return true;
  }
  else if((t1Hour % 12) < (t2Hour % 12)) {
    return false;
  }

  // The two times have the same AM/PM value AND same hour value, compare minute values
  temp1 = t1.split(' ');
  t1Minute = temp1[0].split(':')[1];
  temp2 = t2.split(' ');
  t2Minute = temp2[0].split(':')[1];
  if(t1Minute > t2Minute) {
    return true;
  }
  else {
    return false;
  }
}


/* Function to compare two timestamps for equality t1 == t2 */
function areTimeStampsEqual(t1, t2) {
  if(!compareTimeStamps(t1, t2) && !compareTimeStamps(t2, t1)) { // if t1 !> t2 and t2 !> t1 then t1 == t2
      return true;
  }
  else {
      return false;
  }
}


/* Function to convert timestamp from hh:mm:ss style to hh:mm AM/PM */
function convertTimeStamp(t) {
  // Change time format for database
  let timeTemp = t.split(":");
  let timeTemp2 = '';
  if(timeTemp[0] > 12) {
      if(timeTemp[0] % 12 < 10) {
          timeTemp2 = '0' + (timeTemp[0] % 12) + ':' + timeTemp[1] + ' PM';
      }
      else {
          timeTemp2 = (timeTemp[0] % 12) + ':' + timeTemp[1] + ' PM';
      }
  }
  else if(timeTemp[0] == '00') {
      timeTemp2 = '12' + ':' + timeTemp[1] + ' AM';
  }
  else {
      timeTemp2 = timeTemp[0] + ':' + timeTemp[1] + ' AM';
  }
  return timeTemp2;
}


/* Function to convert a timestamp from hh:mm AM/PM to hh:mm */
function convertTimeStampBack(t) {
  let hour = t.split(':')[0];
  let minute = t.split(':')[1];
  let newMinute = minute.split(' ')[0];
  let meridian = t.split(' ')[1];
  let newHour = -1;
  let returnString = '';
  if(meridian == 'AM') {
    newHour = hour;
  }
  else {
    newHour = parseInt(hour) + 12;
  }
  returnString += newHour + ':' + newMinute;
  return returnString;
}


/* Function to get the current time in hh:mm AM/PM format */
function getCurrentTime() {
  let date = new Date();
  let currentHour = date.getHours();
  let currentMinute = date.getMinutes();
  if(currentHour < 10) {
    currentHour = '0' + currentHour;
  }
  if(currentMinute < 10) {
    currentMinute = '0' + currentMinute;
  }
  return convertTimeStamp(currentHour + ':' + currentMinute);
}


/* Set scope of methods to window so html documents can access */
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;