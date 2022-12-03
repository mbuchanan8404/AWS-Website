///////////////////////////////////////////////////////////////////////////////////////
 ///////////////////////////// Calendar Page Routing //////////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module dynamically generates the calendar page's table and displays events */


/*  Requirements
    4.0.0
    4.1.0
    4.2.0
    4.3.0
*/


const express = require('express');
const router = express.Router();
const path = require('path');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');


const dbItemsManager = require('../back-end/dbItems/dbItemsManager.js');
const batcher = require('../back-end/dbUtilities/dbBatchOpHandler');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//outside applications
const postsession = require('../environment/postsession.js');


/* Route to fetch the main page on inital page load/refresh */
router.get('/calendar',(req,res) => {

    //check user privs to see if they have access to calendar
    /* (Requirement 8.0.0) */
    if(!postsession.checkPrivs(req,"calendar")){
     res.redirect('..');
     return;
    }
    res.sendFile('calendar.html',{root:page_dir})
 });

 
/* Route to fetch the header elements */
router.get('/calendar/header',async (req,res) => {
    let privs = postsession.getSession(req,"privs");

    let json = {privs:privs};

    res.send(json);
});


/* Route to get all events the current user is invited to */
router.get('/calendar/getEvents/',async (req,res) => {
    // First get all the user's event invitations
    var un = postsession.getSession(req, "User_Login") // Fetch the username from the session
    var result = await dbItemsManager.readEventInvitesByUser(un); 
    for(var item in result.Items) {
        result.Items[item].P_Key = result.Items[item].S_Key;
    }
    // Now get the events the user is invited to
    var usersEvents = await batcher.batchGet(result);
    res.send(usersEvents);
});



module.exports = router;