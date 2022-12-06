///////////////////////////////////////////////////////////////////////////////////////
 /////////////////// DYNAMODB DATABASE BATCH OPERATIONS MANAGER ///////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/*  This module is a set of functions to handle batch operations with DynamoDB.
    AWS docs claim a current batch size of 100. Testing revealed batch sizes above 25
    produced errors from DynamoDB. Amazon recomends using an exponential back-off
    algorithm to retry when errors are returned in batch operation responses. */

   
/*  Per AWS docs: queries, scans, and batchGet's can all return more than the current 
    maximum of 16MB's or 25 Items per request. If there are more items to return from the 
    query, scan, or batch get then the results will be returned as a 'page array'. Page 
    arrays are arrays of Item collections, each with a max Count:25 or max size:16MB. */
   

    /* Pages[{Items:[x,x,x,...],Count:25}, {Items:[x,x,x,...],Count:12}] */
   

    /* Before processing inside our system, paginated results from DynamoDB are
       depaginated back into a single item collection using the depaginator. The
       depaginator's implementation is hidden inside the implementation of the
       scan paginator, query paginator, and batch get. */


/*  Requirements
    7.2.0
    7.3.0
    7.4.0
*/


/* Declare a batch size for DynamoDB batch gets, writes, and deletes, 100 items per batch max per AWS docs */
const BATCHSIZE = 25; // More than 25 produces errors


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


/* Batch get Items, pass an Item collection from dynamobdb or build one. Returns all items
   requested using P_Key and S_Key. Performs DePagination on the results before returning. 
   Perform the batch get with up to 25 entries per batch as stated in Amazon AWS DynamoDB Docs */
async function batchGet(itemsToGet) {
    var finalResult = [];
    var batch = {Keys:[]};
    // Construct the batch get request
    for(var i = 0; i < itemsToGet.Count; i++) {
        batch.Keys.push({
            P_Key : itemsToGet.Items[i].P_Key,
            S_Key : itemsToGet.Items[i].S_Key    
        })
        // If the batch is full or we're out of items, perform the get
        if(batch.Keys.length == BATCHSIZE || i == (itemsToGet.Count - 1)) {
            finalResult.push(await performBatchGet(batch));
            batch.Keys = [];
        }
    }
    return dePaginator(finalResult); // depaginate results before returning
}


/* Batch write Items, pass an Item collection from dynamobdb or build one. 
   Returns true for success, false for failure. Perform the batch write with up to 25 
   entries per batch as stated in Amazon AWS DynamoDB Docs */
async function batchWrite(itemsToWrite){
    var batch = [];
    // Construct the batch write request
    for(var i = 0; i < itemsToWrite.Count; i++) {
        var item = {
            PutRequest : {
                Item : itemsToWrite.Items[i]
            }
        };
        batch.push(item);
        // If the batch is full or we're out of items, perform the write
        if(batch.length == BATCHSIZE || i == (itemsToWrite.Count - 1)) {
            await performBatchWrite(batch);
            batch = [];
        }
    }
    return true;
}


/* Batch delete Items, pass an Item collection from dynamobdb or build one.
   Returns true for success, false for failure. Perform the batch delete with up to 25 
   entries per batch as stated in Amazon AWS DynamoDB Docs */
async function batchDelete(itemsToDelete){
    var batch = [];
    // Construct the batch delete request
    for(var i = 0; i < itemsToDelete.Count; i++) {
        var item = {
            DeleteRequest : {
                Key : {
                    P_Key : itemsToDelete.Items[i].P_Key,
                    S_Key : itemsToDelete.Items[i].S_Key    
                }
            }
        };
        batch.push(item);
        // If the batch is full or we're out of items, perform the delete
        if(batch.length == BATCHSIZE || i == (itemsToDelete.Count - 1)) {
            await performBatchWrite(batch);
            batch = [];
        }
    }
    return true;
}


/* Perform the batch write operation (write/delete) retrying failed operations with an 
   exponetial back-off of up to 0.512 seconds per AWS docs. Batch deletes are masked as
   batch writes per AWS docs.*/
async function performBatchWrite(batch) {
    var batchOp = {RequestItems: {[TABLE_NAME]: batch}};
    try{
        var result =  await dynamoClient.batchWrite(batchOp).promise();
        var expBackOff = 128;
        while(result.UnprocessedItems.Items && expBackOff <= 512) {
            try{
                await new Promise(t => setTimeout(() => t(), expBackOff));
                expBackOff = expBackOff * 2;
                result = await dynamoClient.batchWrite(result.UnprocessedItems).promise();
            }catch(error) {
                console.log(error);
            }
        }
    }catch(error){
        console.log(error);
        return false;
    }
    return true;
}


/* Perform the batch get operation, retrying failed operations with an 
   exponetial back-off of up to 0.512 seconds per AWS docs. */
async function performBatchGet(batch) {
    var batchOp = {RequestItems: {[TABLE_NAME]: batch}};
    var finalResult = {Items:[],Count:0};
    try {
        var result =  await dynamoClient.batchGet(batchOp).promise();
        finalResult.Items.push(...result.Responses[TABLE_NAME]);
        // If DynamodDB returns unprocessed batch items, retry up to 3 times with exponetial back-off per AWS docs
        var expBackOff = 128;
        while(result.UnprocessedKeys.Keys && expBackOff <= 512) {
            try{
                await new Promise(t => setTimeout(() => t(), expBackOff));
                expBackOff = expBackOff * 2;
                result = await dynamoClient.batchGet(result.UnprocessedKeys).promise();
                finalResult.Items.push(...result.Responses[TABLE_NAME]);
            }catch(error) {
                console.log(error);          
            }
        }
    }catch(error){
        console.log(error);
        return {Items:[],Count:0};
    }
    finalResult.Count = finalResult.Items.length;
    return finalResult;
}


/* Paginator for scan operation results */
async function scanPaginator(params) {
    pages = [];
    try {
        var result = await dynamoClient.scan(params).promise();
        pages.push(result);
        while (result.LastEvaluatedKey) {
            params.ExclusiveStartKey = result.LastEvaluatedKey;
            result = await dynamoClient.scan(params).promise();
            pages.push(result);
        }
    }catch(error){ 
        return {Items:[],Count:0};
    }
    return dePaginator(pages); // Send the results to the depaginator before returning
}


/* Paginator for query operation results */
async function queryPaginator(params) {
    pages = [];
    try {
        var result = await dynamoClient.query(params).promise();
        pages.push(result);
        while (result.LastEvaluatedKey) {
            params.ExclusiveStartKey = result.LastEvaluatedKey;
            result = await dynamoClient.query(params).promise();
            pages.push(result);
        }
    }catch(error){ 
        return {Items:[],Count:0};
    }
    return dePaginator(pages); // Send the results to the depaginator before returning
}


/* De-Paginate a page array back into a single item collection */
function dePaginator(pages) {
    var dePaginatedResults = {Items:[], Count:0}; // Create an empty items collection
    for(var page in pages) {
        dePaginatedResults.Items.push(...pages[page].Items); // add all the items in the page to our result
    } 
    dePaginatedResults.Count = dePaginatedResults.Items.length;
    return dePaginatedResults; // return the reassembled items collection
}


module.exports = {
    batchWrite, batchDelete, batchGet, scanPaginator, queryPaginator, dePaginator
}