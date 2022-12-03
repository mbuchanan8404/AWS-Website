///////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////// DYNAMODB DATABASE TABLE MANAGER ////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module is a set of functions for safely creating, reading, updating, and 
   deleting the Table and its items, as a group, from the online database stored on AWS. 
   The functions exported from this file enforce all constraints for maintaining 
   referencial integrity. Input validation is NOT done in this module */


/*  Requirements
    ALL Everything depends on the table existing on AWS
    *.*.*
*/


/* Import the Amazon Web Services library */
const AWS = require('aws-sdk');


/* Update the Amazon Web Services DynamoDB access control credentials */
AWS.config.update({
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: ""
});


/* Use the Amazon Dynamodb Client Interface to create and delete the table */
const client = new AWS.DynamoDB();


/* Use the Amazon DynamoDB Document Client Interface to access and modify the data in 
   the data base */
const dynamoClient = new AWS.DynamoDB.DocumentClient();


/* Define a Table Name */
const TABLE_NAME = 'Dojo_Stream';


/*************************************************************************************/
/******************************* BEGIN TABLE FUNCTIONS *******************************/
/*************************************************************************************/


/* Create the Table. Return true if successful, false if failed. */
async function createTable() {
    try {
        var params = {
            TableName: TABLE_NAME,
            AttributeDefinitions: [
                {AttributeName: "P_Key", AttributeType: "N"},        // PARTITION KEY
                {AttributeName: "S_Key", AttributeType: "N"},        // SORT KEY, GSI SORT KEY
                {AttributeName: "User_Login", AttributeType: "S"},   // GSI PARTITION KEY
                {AttributeName: "User_Name", AttributeType: "S"},    // GSI PARTITION KEY
                {AttributeName: "Event_Title", AttributeType: "S"},  // GSI PARTITION KEY
                {AttributeName: "Event_Date", AttributeType: "S"},   // GSI PARTITION KEY
                {AttributeName: "Message", AttributeType: "S"}       // GSI PARTITION KEY
            ],

            KeySchema: [
                {AttributeName: "P_Key", KeyType: "HASH"},              
                {AttributeName: "S_Key", KeyType: "RANGE"},             
            ],

            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            GlobalSecondaryIndexes: [{
            // This GSI projects only Users with User_Login as the key,
            // allowing fast readAllUsers()
                IndexName: "Login",
                KeySchema: [
                    {AttributeName: "User_Login", KeyType: "HASH"}
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            },
            // This GSI projects all Entries wtih S_Key as partition key,
            // allowing fast event-to-user searches
            {
            IndexName: "SKey",
                KeySchema: [
                    {AttributeName: "S_Key", KeyType: "HASH"}
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                    ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            },
            // This GSI projects only Users with User_Name as the 
            // partition key allowing for fast readUserByName()
            {
                IndexName: "UserName",
                KeySchema: [
                    {AttributeName: "User_Name", KeyType: "HASH"},
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            },
            // This GSI projects Events and Event Invites with Event_Title as 
            // the partition key and S_Key as sort key allowing for fast 
            // readAllEventsInvitesByEvent()
            {
                IndexName: "Title",
                KeySchema: [
                    {AttributeName: "Event_Title", KeyType: "HASH"},
                    {AttributeName: "S_Key", KeyType: "RANGE"}

                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            },
            // This GSI projects Users and Events with P_Key as the Primary Key and
            // Event_Date as the sort key allowing for fast readAllEventsInvitesByUser()
            {
                IndexName: "Date",
                KeySchema: [
                    {AttributeName: "P_Key", KeyType: "HASH"},
                    {AttributeName: "Event_Date", KeyType: "RANGE"}

                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            },
            // This GSI projects only Event Invites with Message as the key, 
            // allowing fast readAllEventInvites()
            {
                IndexName: "Message",
                KeySchema: [
                    {AttributeName: "Message", KeyType: "HASH"}  
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1
                },
            }]

        };
        await client.createTable(params).promise();
        return true;
    }catch (error) {
        console.log(error);
    }
    return false;
}


/* Scan entire Table and log it's contents */
async function readTable() {
    try {
        var params = {
            TableName: TABLE_NAME,
        };
        var result = await batchOperator.scanPaginator(params);
    }catch (error) {
        console.log(error);
        return {Items:[],Count:0};
    }
    return result;
}


/* Read Item by Key values */
async function readItemByKey(pKey, sKey) {
    try {
        var params = {
            TableName: TABLE_NAME,
            Key: {P_Key: pKey, S_Key: sKey},
        };
        var result = await dynamoClient.get(params).promise();
    }catch (error) {
        return {Item:[]}; // return an empty DynamoDB item
    }
    return result;
}


/* Delete all Items in table */
async function deleteAllItems() {
    var items = await readTable();
    var result = await batchOperator.batchDelete(items);
    if(result) {
        return true;
    }
    return false;
}


/* Delete the Table. Returns true if successful, false if unsuccessful */
async function deleteTable() { // Big security risk on this interface obviously
    try {
        var params = {
            TableName: TABLE_NAME,
        };
        await client.deleteTable(params).promise();
        return true;
    }catch (error) {
        console.log(error);
        return false;
    }
}


module.exports = {
    createTable, readItemByKey,  deleteTable
}