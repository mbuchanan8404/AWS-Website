
//routing services 
const express = require('express');
const router = express.Router();
const path = require('path');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');

//outside applications
const postsession = require('../environment/postsession.js');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//
//home get loads the home page
//(Requirement 3.0.0)
//
router.get('/home',async (req,res) => {
    //check user privs to see if they have access to home

    if(!postsession.checkPrivs(req,"home")){
        res.redirect('..');
        return;
    }

    res.sendFile('home.html',{root:page_dir});
});

//
//Get header for home page
//(Requirement 3.1.0)
router.get('/home/header/',async (req,res) => {
    let privs = postsession.getSession(req,"privs");

    //wrap in json, since 
    let json = {privs:privs};

    res.send(json);
});

module.exports=router;