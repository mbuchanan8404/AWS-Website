///////////////////////////////////////////////////////////////////////////////////////
 /////////////////////////////// Event Page Routing ///////////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/*  Requirements
    7.1.0
    7.2.0
    7.3.0
    7.4.0
    7.5.0  
*/


const express=require('express');
const router = express.Router();
const path = require('path');


/* User created db functions */
const dbInputValidator = require('../back-end/dbInputValidation.js')
const batcher = require('../back-end/dbUtilities/dbBatchOpHandler');
const dbAPI = require('../back-end/dbItems/dbItemsManager.js');

const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//outside applications
const postsession = require('../environment/postsession.js');

/* Route to get the events main page on intial load */
/* (Requirement 8.3.0) */
router.get('/events/',(req,res) => {

    //check user privs to see if they have access to home
    /* (Requirement 8.0.0) */
    if(!postsession.checkPrivs(req,"events")){
     res.redirect('..');
     return;
    }
    res.sendFile('events.html',{root:page_dir})
 });


 /* Route to get all users from database for event invites */
 router.get('/events/getUsers/',async (req,res) => {
    var result = await dbAPI.readAllUsers();
    res.send(result);
 });


/* Route to get all events for the event display */
router.get('/events/getEventList/', async (req,res) => {
    var result = await dbAPI.readAllEvents();
    res.send(result);
});


/* Route to create event invites for all selected users */
router.post('/events/createEventInvites/', async (req,res) => {
    var result = await batcher.batchWrite(req.body);
    res.send(JSON.stringify({message:'Success'}));
});


/* Route to create a new event */
router.post('/events/createEvent/',async (req,res) => {
    // Pass the parameters through the database input validator
    var eventParameters= [];
    eventParameters.push(dbInputValidator.validate_Event_Title(req.body.Event_Title));
    eventParameters.push(dbInputValidator.validate_Event_Description(req.body.Event_Description));
    eventParameters.push(dbInputValidator.validateTimeFormat(req.body.Event_Start_Time));
    eventParameters.push(dbInputValidator.validateTimeFormat(req.body.Event_End_Time));
    eventParameters.push(dbInputValidator.validateDateFormat(req.body.Event_Date));
    eventParameters.push(dbInputValidator.validate_Address(req.body.Event_Address));
    eventParameters.push(dbInputValidator.validate_City(req.body.Event_City));
    eventParameters.push(dbInputValidator.validate_State(req.body.Event_State));
    eventParameters.push(dbInputValidator.validate_Zip(req.body.Event_Zip));
    // If any parameter failed validation, abort event creation and return parameters
    var badParams = {message:''}
    for(var param in eventParameters) {
        if(eventParameters[param][0] == false) {
            badParams.message += eventParameters[param][1] + ', ';
        }
    }
    if(badParams.message != '') {
        res.send(JSON.stringify(badParams));
        return;
    }
    var ep = [];
    for(e in eventParameters) {
        ep.push(eventParameters[e][1]);
    }
    ep.push(false); // set event attribute Event_Cancelled to false before creating
    // Create the event
    let result = await dbAPI.createEvent(ep);
    if(result  ) {
        res.send(JSON.stringify({message:'Success'}));
    }
    else {
        res.send(JSON.stringify({message:'Event already exists'}));
    }
});


/* Route to get all invites for the selected event */
router.post('/events/getInviteList/', async (req,res) => {
    var sKey = req.body.b;
    var result = await dbAPI.readEventInvitesBySKey(sKey);
    res.send(JSON.stringify(result));
});


/* Route to delete event for selected event */
router.post('/events/deleteEvent/', async (req,res) => {
    var result = await dbAPI.deleteEvent(req.body.eventToDelete);
    if(!result){
        res.send(JSON.stringify({message:'Failed to delete event!'}));
        return;
    }
    else {
        res.send(JSON.stringify({message:'Success'}));
    }
});


/* Route to check inputs for a db user write. For checking if event modification will
   go through before deleting the old event. */
router.post('/events/checkEventInputs', async (req,res) => {
    var eventParameters= [];
    eventParameters.push(dbInputValidator.validate_Event_Title(req.body.Event_Title));
    eventParameters.push(dbInputValidator.validate_Event_Description(req.body.Event_Description));
    eventParameters.push(dbInputValidator.validateTimeFormat(req.body.Event_Start_Time));
    eventParameters.push(dbInputValidator.validateTimeFormat(req.body.Event_End_Time));
    eventParameters.push(dbInputValidator.validateDateFormat(req.body.Event_Date));
    eventParameters.push(dbInputValidator.validate_Address(req.body.Event_Address));
    eventParameters.push(dbInputValidator.validate_City(req.body.Event_City));
    eventParameters.push(dbInputValidator.validate_State(req.body.Event_State));
    eventParameters.push(dbInputValidator.validate_Zip(req.body.Event_Zip));
    // If any parameter failed validation, return a list of error messages
    var badParams = {message:''}
    for(var param in eventParameters) {
        if(eventParameters[param][0] == false) {
            badParams.message += eventParameters[param][1] + ', ';
        }
    }
    if(badParams.message != '') {
        res.send(JSON.stringify(badParams));
        return;
    }
    else {
        var parametersGoodMessage = {message:"Success"};
        res.send(JSON.stringify(parametersGoodMessage));
    }
});


 module.exports = router;