
const { json } = require('body-parser');
const express=require('express');
const router = express.Router();
const path = require('path');
const dbAPI = require('../back-end/dbItems/dbItemsManager');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');
const postsession = require('../environment/postsession.js');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//
//load dashboard page
//(Requirement 6.0.0)
//
router.get('/dashboard',async (req,res) => {

    //check user privs to see if they have access to dashboard
    /* (Requirement 8.0.0) */
    if(!postsession.checkPrivs(req,"dashboard")){
        res.redirect('..');
        return;
    }

    res.sendFile('dashboard.html',{root:page_dir})
});  

//
//load data to prefill dashboard page
//(Requirement 6.1.0)
router.get('/dashboard/loadData/',async(req,res)=> {
  
    const result = await dbAPI.readAllUsers();

    const resultEvent = await dbAPI.readAllEvents();

    const mergeResult = JSON.stringify(result) + '%1%' + JSON.stringify(resultEvent);

    res.send(mergeResult);
});

router.get('/dashboard/header/',async (req,res) => {
    let privs = postsession.getSession(req,"privs");

    //wrap in json, since 
    let json = {privs:privs};

    res.send(json);
});

module.exports=router;