///////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////// DYNAMODB DATABASE ITEMS MANAGER ////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module is a set of functions for safely creating, reading, updating, and 
   deleting items from the Amazon DynamoDB Single Table Database stored on Amazon 
   Web Services. The functions exported from this file enforce all constraints for
   maintaining referencial integrity. Input validation is NOT done in this module. */


/*  Requirements
    1.0.*
    1.2.0
    2.1.0
    5.1.0
    5.2.0
    5.3.0
    6.1.0
    7.1.0
    7.2.0
    7.3.0
    7.4.0
*/


/* Import the needed components of our database interface system */
const atomicCounter = require("../dbUtilities/dbAtomicCounter.js");
const batchOperator = require("../dbUtilities/dbBatchOpHandler.js");
const aes = require("../encryption/aes.js");


/* Import the Amazon Web Services library */
const AWS = require('aws-sdk');


/* Update the Amazon Web Services DynamoDB access control credentials */
AWS.config.update({
    region: "us-east-1",
    accessKeyId: "AKIATHORXF4C6Y2PW47I",
    secretAccessKey: "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"
});


/* Use the Amazon DynamoDB Document Client Interface to access and modify the data in 
   the data base */
const dynamoClient = new AWS.DynamoDB.DocumentClient();


/* Define a Table Name */
const TABLE_NAME = 'Dojo_Stream';



/*******************************************************************************************/
/********************************** BEGIN USER FUNCTIONS ***********************************/
/*******************************************************************************************/


/* Create a user in the db with all key value pairs supplied. This Function is passed an
   array with the values for each database entry in the correct order and type, except
   for the two keys. Returns true if successful false if unsuccessful */
   async function createUser(userData) {
    // Check for empty input, there MUST be a User_Login for each user
    if(!userData || !userData[1]) {
        return false;
    }
    // CHECK CONSTRAINT: A User must have a unique User_Login
    var userLogin = await readUserByLogin(userData[1]);
    if(userLogin.Count != 0) { // If the user already exists return false
        return false;
    }
    // Get a set of unique keys
    var newKey = await atomicCounter.getNewKeys();
    // Failed to get a unique key due to too much database traffic on KeyGenerator
    if(newKey == -1) {
        return false;
    } 
    try {
        var params = {
            TableName: TABLE_NAME,
            Item: {
                P_Key: newKey,                              // int
                S_Key: newKey,                              // int
                User_Name: userData[0],                     // string
                User_Login: userData[1],                    // string    GSI for Login
                User_Password: userData[2],                 // string
                Administrator: userData[3],                 // boolean
                User_Backup_Question: userData[4],          // string
                User_Backup_Answer: userData[5],            // string
                User_Balance: userData[6],                  // decimal   ex. 12.34
                User_Due_Date: userData[7],                 // string    ex. "01/23/2045"
                Account_Start_Date: userData[8],            // string    ex. "01/23/2045"
                Account_End_Date: userData[9],              // string    ex. "01/23/2045"
                Account_Suspended: userData[10],            // boolean
                User_Phone: userData[11],                   // string    ex. "123-456-7899"
                Address: userData[12],                      // string
                City: userData[13],                         // string
                State: userData[14],                        // string
                Zip: userData[15],                          // int
                User_Email: userData[16],                   // string
                User_Belt: userData[17]                     // string, Color ex. "Yellow"
            }
        };
        await dynamoClient.put(params).promise();
        return true;
    }catch (error) {
        return false;
    }
}


/* Get a single user by User_Login */
async function readUserByLogin(login) { 
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "Login", // Use the GSI based on User_Login as p-key
            KeyConditionExpression: "User_Login = :l",
            ExpressionAttributeValues: { ":l" : login
            },
        };
        var result = await dynamoClient.query(params).promise();
    }catch (error) {
        return {Items:[],Count:0};
    }
    return result;
}


/* Get users by User_Name */
async function readUserByLikeName(name) {
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "UserName", // Project only Users for the scan
            ExpressionAttributeValues: { ":n" : name },
            FilterExpression: "contains (User_Name, :n)",
        };
        var result = await batchOperator.scanPaginator(params);
    }catch (error) {
        return {Items:[],Count:0};
    }
    return result;
}


/* Get all users in data base */
async function readAllUsers() {
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "Login", // Use the GSI based on User_Login as p-key
        };
        var result = await batchOperator.scanPaginator(params);
    }catch (error) {
        return {Items:[],Count:0}; // Return an empty query object
    }
    return result;
}


/* Get a list of user's logins */
async function getAllUserLogins(field){
    let masterJson = await readAllUsers();
    let userJson = masterJson["Items"];
    let users = [];

     for(let member in userJson){
        let userinfo = userJson[member][field];
         users.push(userinfo);
    }
    return users;
}


/* Modify an existing user's every atttribute. Returns true if successful false 
   if unsuccessful. */
   async function updateUserAll(data) {
    // Administrator field cannot be changed
    userToModify = await readUserByLogin(data['Login']);
    // Check if user exists
    if(userToModify.Count == 0) {
        return false;
    }
    // Get the P_Key of the user to modify
    userToModify = userToModify.Items[0].P_Key;
    // Construct the query parameters and perform the modification
    try {
        var params = {
            Key: {
                P_Key : userToModify,
                S_Key : userToModify
            },
            TableName: TABLE_NAME,
            UpdateExpression: 'set User_Email = :newEmail, Account_Start_Date = :newStartDate ,' + 
                                  'Address = :newAddress, City = :newCity ,' +
                                  'Zip = :newZip , ' + 
                                  'User_Phone = :newPhone, Account_Suspended = :newSuspended ,' +
                                  'Administrator = :newAdmin, User_Belt = :newBelt ',
            ExpressionAttributeValues: {
                ':newEmail': data.Email,
                ':newStartDate': data.StartDate,
                ':newAddress': data.Address,
                ':newCity' : data.City,
                ':newZip': data.Zip,
                ':newPhone': data.Phone,
                ':newSuspended': data.Suspended,
                ':newAdmin': data.Admin,
                ':newBelt': data.Belt,
            } 
        };
        await dynamoClient.update(params).promise();
    }catch (error) {
        return false;
    }
    return true;
}


/* Delete User from Data Base by User_Login. Returns true if successful false if unsuccessful */
async function deleteUser(un) {
    // First check if user exists
    var userToDelete = await readUserByLogin(un);
    if(userToDelete.Count == 0) {
        return false;
    }
    // Get the P_Key of the User to delete
    userToDelete = userToDelete.Items[0].P_Key;
    // ENFORCE CONSTRAINT: When a User is deleted, all databse entries with that User's P_key as their
    // S_Key, representing that User's ownership of that enrty, also need deleted.
    try {
        var params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "P_Key = :p",
            ExpressionAttributeValues: {":p" : userToDelete},
        };
        var allEntriesForUser = await batchOperator.queryPaginator(params);
    }catch (error) {
        return false;
    }
    if(await batchOperator.batchDelete(allEntriesForUser)) {
        return true;
    }
    return false;
}


/* Authenticate user login credentials, return true if authenticated false if not */
async function authenticateUser(un, pw) {
    // Fetch the record by User_Name, return false if user not found in data base
    result = await readUserByLogin(un);
    if(result.Count == 0) {
        return {
            valid:false,
            output:"User not present in database by User_Login"
        };
    }
    //initialize password as users pass in db
    let password = result.Items[0].User_Password;
    //decrypt users password if it is in hex form
    if(password.match(/[0-9A-Fa-f]{6}/g)){
        password = aes.decrypt(password);
    }
    // If the passwords match, authentication successful
    if(password == pw) {
        return {
            valid:true,
            output:"User Authenticated!"
        };
    }
    return {
        valid:false,
        output:"Username or Password incorrect, please try again"
    };
}


/*******************************************************************************************/
/********************************** BEGIN EVENT FUNCTIONS **********************************/
/*******************************************************************************************/


/* Create an Event. This Function is passed an array with the values for each database entry
   in the correct order and type, except for the two keys. Returns true if successful false
   if unsuccessful */
   async function createEvent(eventData) {
    // CHECK CONSTRAINT: Each Event must have a unique Event_Title
    let meeting = await readEvent(eventData[0]); // No two Events may share an Event_Title
    if(meeting.Count != 0) { // If the event already exists return false
        return false;
    }
    // Get a set of unique keys
    let newKey = await atomicCounter.getNewKeys();
    // Failed to get a unique key due to too much database traffic on KeyGenerator
    if(newKey == -1) {
        return false;
    }
    try {
        var params = {
            TableName: TABLE_NAME,
            Item: {
                P_Key: newKey,                    
                S_Key: newKey,                    
                Event_Title: eventData[0],               // string GSI for Title
                Event_Description: eventData[1],         // string
                Event_Start_Time: eventData[2],          // string ex. "10:30 PM"
                Event_End_Time: eventData[3],            // string ex. "11:30 PM"
                Event_Date: eventData[4],                // string ex. "01/23/2045"
                Address: eventData[5],                   // string
                City: eventData[6],                      // string
                State: eventData[7],                     // string
                Zip: eventData[8],                       // int
                Event_Cancelled: eventData[9],           // boolean
            }
        };
        let result = await dynamoClient.put(params).promise();
    }catch (error) {
        return false;
    }
    return true;
}


/* Read an Event by Event_Title */
async function readEvent(title) { 
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "Title", // Use the GSI based on Event_Title as p-key
            KeyConditionExpression: "Event_Title = :t",
            ExpressionAttributeValues: {":t": title},
            ExpressionAttributeNames: {"#d" : "Event_Date"},
            FilterExpression: "attribute_exists(#d)"
        };
        var result = await batchOperator.queryPaginator(params);
    }catch (error) {
        return {Items:[],Count:0};
    }
    return result;
}


/* Get all Events in data base */
async function readAllEvents() {
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "Title", // Use the GSI based on Event_Title as p-key
            ExpressionAttributeNames: {"#d" : "Event_Date"},
            FilterExpression: "attribute_exists(#d)"
        };
        var result = await batchOperator.scanPaginator(params);
    }catch (error) {
        return {Items:[],Count:0};
    }
    return result;
}


/* Delete Event from Data Base by Event_Title. This also deletes all event invites to that event.
   Returns true if successful false if unsuccessful. */
   async function deleteEvent(eventTitle) {
    // First check if Event exists
    var eventToDelete = await readEvent(eventTitle);
    if(eventToDelete.Count == 0) {
        return false;
    }
    // Get the S_Key of the Event to delete
    eventToDelete = eventToDelete.Items[0].S_Key;
    // ENFORCE CONSTRAINT: When an Event is deleted, all Event Invites for that Event must also be deleted
    // Construct the query parameters
    try {
        var params = {
            TableName: TABLE_NAME,
            IndexName: "SKey",
            KeyConditionExpression: "S_Key = :s",
            ExpressionAttributeValues: {":s" : eventToDelete}
        };
        var allEntriesForEvent = await batchOperator.queryPaginator(params);
    }catch (error) {
        return false;
    }
    // Call the batch delete for all the Event's entries and the Event itself
    if(await batchOperator.batchDelete(allEntriesForEvent)) {
        return true;
    }
    return false; // batch delete failed, this should be unreachable
}


// Function to get today's date, returns todays date in "MM/DD/YYYY" form
function getTodaysDate(){
    let date = new Date();

    //function adds leading 0
    let pad = num => num.toString().padStart(2,'0');
    return `${pad(date.getMonth()+1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}


/*******************************************************************************************/
/******************************* BEGIN EVENT INVITE FUNCTIONS ******************************/
/*******************************************************************************************/
/* Since there is a many-to-many relationship between Users and Events, changes made to     /
/  either Events or Users must be propagated to any applicable Event Invites. For example,  /
/  when an Event is deleted, not just canceled, all Event Invites for that Event must be    /
/  deleted also. When a User is Deleted, all Event Invites to that User must also be        /
/  deleted.An Event Invite's partition key is the partition key of the invited User,        /
/  and an Event Invite's sort key is the sort key of the Event they are invited to.        */
//=========================================================================================//


/* Get all Event Invites for a given User, queries GSI: "Message" */
async function readEventInvitesByUser(un) {
    // Check if User exists
    var user = await readUserByLogin(un);
    if(user.Count == 0) {
        return {Items:[],Count:0};
    }
    // Get the P_Key of the user
    user = user.Items[0].P_Key;
    try {
        var params = { 
            TableName: TABLE_NAME,
            KeyConditionExpression: "P_Key = :p",
            ExpressionAttributeValues: {":p": user},
            ExpressionAttributeNames: {"#m" : "Message"},
            FilterExpression: "attribute_exists(#m)"
        };
        var result = await batchOperator.queryPaginator(params);
    }catch (error) {
        console.error(error);
        return {Items:[],Count:0};
    }
    return result;
}


/* Get all Event Invites for a given Event by S_Key, queries GSI: "SKey" */
async function readEventInvitesBySKey(sKey) {
    try {
        var params = { 
            TableName: TABLE_NAME,
            IndexName: "SKey",
            KeyConditionExpression: "S_Key = :s",
            ExpressionAttributeValues: { ":s" : sKey},
            ExpressionAttributeNames: {"#m" : "Message"},
            FilterExpression: "attribute_exists(#m)",
        };
        var result = await batchOperator.queryPaginator(params);
    }catch (error) {
        return {Items:[],Count:0};
    }
    return result;
}


module.exports = {
    createUser, readAllUsers, readUserByLogin, readUserByLikeName, updateUserAll, deleteUser, authenticateUser,
    getAllUserLogins, createEvent, readEvent, readAllEvents, deleteEvent, getTodaysDate,
    readEventInvitesBySKey, readEventInvitesByUser, 
}