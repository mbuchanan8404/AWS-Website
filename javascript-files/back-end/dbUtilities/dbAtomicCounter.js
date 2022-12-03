///////////////////////////////////////////////////////////////////////////////////////
 ///////////////////// DYNAMODB DATABASE ATOMIC KEY GENERATOR /////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module is a set of functions for safely creating, deleting, and getting key 
   value 'x' from the database entry at [P_Key:0, S_Key:0, KeyGenerator:'x']. Each new
   User or Event needs a unique key to duplicate across it's P_Key and S_Key fields. 
   The key value is updated at the same time it is read, and the updated value is
   returned from the database. This operation is atomic per AWS docs.*/


/*  Requirements
    1.0.*
    7.2.0
    7.3.0
    7.4.0
*/


/* Import the Amazon Web Services library */
const AWS = require('aws-sdk');


/* Update the Amazon Web Services DynamoDB access control credentials */
AWS.config.update({
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: ""
});


/* Use the Amazon DynamoDB Document Client Interface to access and modify the data in 
   the data base */
const dynamoClient = new AWS.DynamoDB.DocumentClient();


/* Define a Table Name */
const TABLE_NAME = 'Dojo_Stream';


/*==================================================================================================//
/  Get a unique set of keys for the data base. These 4 functions are crucial to the integrity of     /
/  the database by acting as an auto increment for P_Key and S_Key. It ensures that each new Event   /
/  or User gets a unique and identical partition and sort key. Event Invites use an existing User's  /
/  and Event's keys for their partition key and sort key to link a user to an event to form the      /
/  invitation. KeyGenerator uses the third attribute, KeyGenerator, in the first field in the table  /       
/  {P_Key: 0, S_Key: 0, KeyGenerator} to hold an Atomic Counter. The update reads and increments the /
/  value of KeyGenerator atomically.                                                                 /
//==================================================================================================*/ 


/* Create the database entry that acts as an atomic counter for P_Key and S_Key of Users/Events.
   Only gets created if it doesn't exist at key [0 : 0] */
   async function createAtomicCounterEntry() {
    try {
        var params = {
            Key: {
                P_Key : 0,
                S_Key : 0
            },
            TableName: TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(KeyGenerator)', // Only create if it doesn't exist
            UpdateExpression: 'set KeyGenerator  = :newValue',
            ExpressionAttributeValues: {':newValue' : 0} 
        };
        await dynamoClient.update(params).promise();
    }catch (error) {
        console.log("Atomic Counter creation failed");
        return false;
    }
    return true; 
}


/* Atomically fetch a unique key from the database entry serving as an atomic counter */
async function getNewKeys() {
    try {
        var params = {
            Key: {
                P_Key : 0,
                S_Key : 0
            },
            // The KeyGenerator field will increment atomically on update and return its updated value
            TableName: TABLE_NAME,
            UpdateExpression: 'SET KeyGenerator = KeyGenerator + :increment',
            ExpressionAttributeValues: {':increment' : 1},
            ReturnValues: "UPDATED_NEW"
        };
        var result = await dynamoClient.update(params).promise();
    }catch (error) {
        console.log(error);
        return -1; // negative key value signifies dynamodb failure during key update
    }
    return result.Attributes.KeyGenerator;
}


/* Get a batch of unique keys for a batch write of Users or Events */
async function getBatchOfNewKeys(numberOfKeys) {
    try {
        var params = {
            Key: {
                P_Key : 0,
                S_Key : 0
            },
            // The KeyGenerator field will increment atomically on update by numberOfKeys and return its updated value
            TableName: TABLE_NAME,
            UpdateExpression: 'SET KeyGenerator = KeyGenerator + :increment',
            ExpressionAttributeValues: {':increment' : numberOfKeys},
            ReturnValues: "UPDATED_NEW"
        };
        var result = await dynamoClient.update(params).promise();
    }catch (error) {
        console.log(error);
    }
    return result.Attributes.KeyGenerator;
}


/* Delete the Atomic Counter at [0 : 0] */
async function deleteAtomicCounter() {
    // Construct the query parameters and perform the delete
    try {
        var params = {
            Key: {
                P_Key : 0,
                S_Key : 0
            },
            TableName: TABLE_NAME
        };
        await dynamoClient.delete(params).promise();
    }catch (error) {
        console.log(error);
        return false;
    }
    return true;
}


module.exports = {
    createAtomicCounterEntry, getNewKeys, getBatchOfNewKeys, deleteAtomicCounter
}