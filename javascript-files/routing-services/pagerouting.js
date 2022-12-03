//express modules
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//outside routes
const accounts = require("./account_routing");
const registration = require('./registration_routing');
const calendar = require('./calendar_routing');
const dashboard = require('./dashboard_routing');
const loginroutes = require('./login_routing');
const homeroutes = require('./home_routing');
const eventsroutes = require('./events_routing');

//other implementations
const postsession = require('../environment/postsession');

//project definition
const PORT = 8080;
const path = require('path');
const project_dir = path.join(__dirname,'../../');
const page_dir = path.join(project_dir,'pages');

//initial landing screen
/* (Requirement 2.0.0) */
const initialscreen = path.join('login.html');

//add both page and project directory so express can locate it
app.use(express.static(project_dir));
app.use(express.static(page_dir,{index : initialscreen}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//------------------------------------------------------------------------------
//------------------------- SESSION PARSER CODE START --------------------------
//------------------------------------------------------------------------------
const session = require('express-session');

//parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret:"THISISSCRET"
}));

/* /logout POST */
/* (Requirement 8.2.0) */
app.post('/logout',async (req,res)=>{
  //clear cookies and session
  postsession.clearSession(req);

  //redirect to home
  res.sendFile('login.html',{root:page_dir});
});

//--------------------------------------------------------
//---------------OUTSIDE APPLICATION ROUTES---------------
//--------------------------------------------------------

//registration route
app.use(registration);

//login route
app.use(loginroutes);

//calendar route
app.use(calendar);

//account route
app.use(accounts);

//dashboard route
app.use(dashboard);

//home route
app.use(homeroutes);

//events route
app.use(eventsroutes);

app.listen(PORT, () => {
  console.log(`PORT: ${PORT}`)
})

//--------------------------------------------------------
//---------------------PAGE NOT FOUND---------------------
//--------------------------------------------------------

/* Direct non-existent pages to login screen */
/* (Requirement 8.1.0) */
app.get('*',(req,res)=>{
  res.sendFile('login.html',{root:page_dir});
})