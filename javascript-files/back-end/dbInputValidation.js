///////////////////////////////////////////////////////////////////////////////////////
 /////////////////////// DYNAMODB DATABASE INPUT VALIDATOR ////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module is a set of functions to ensure no improperly formatted/typed data
   is stored on the database. All data going into the database passes through the
   functions in this file. Can also be exported for user-side input validation */


/* All functions will take an input, perform type and format validation checks, and
   return a Boolean for pass/failure along with a string with either an error 
   description or the cleaned up input. */


/*  Requirements
    1.0.*
    1.1.0
*/



/* ================================================================================ */
/* ========================= BEGIN USER FIELD VALIDATION ========================== */
/* ================================================================================ */


/* Validate input for the field [User_Name:String]  */
/* Requirement (1.0.1) */
function validate_User_Name(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check input for appropriate length
    if(input.length > 50) {
        return [false, "User's name must be 50 characters or less in length"]
    }
    // Check input against regex for name field
    if(!/^[a-zA-Z ]+$/.test(input)) {
        return [false, "Names contain only letters and spaces"];
    }
    // Capitalize the name before input
    for(var letter in input) {
        input[letter] = input[letter].toUpperCase()
    }
    return [true, input];
}


/* Validate input for the field [User_Login:String] ex. M_Buch or A_Coyl */
/* Requirement (1.0.10) */
function validate_User_Login(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check input for appropriate length
    if(input.length < 6) {
        return [false, "User's login must be at least 6 characters in length"]
    }
    // Check input against regex for user login
    else if(!/[A-Z][a-z]+/.test(input)) {
        return [false, "Logins have the following format: 'M_Buch'"]
    }
    return [true, input];
}


/* Validate input for the field [User_Password:String] */
/* Requirement (1.0.11) */
function validate_User_Password(input) {
   // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check input for appropriate length
    if(input.length < 8) {
        return [false, "Passwords must be at least 8 characters in length"];
    }
    // Check input against the regex for a password
    else if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(input)) {
        return [false, "Passwords must contain at least one upper case letter, one lower case letter, and one number"]
    }
    return [true, input];
}


/* Validate input for the field [Administrator:Boolean] */
function validate_Administrator(input) {
    return validate_Boolean(input);
}


/* Validate input for the field [User_Backup_Question:String] */
/* Requirement (1.0.12) */
function validate_Backup_Question(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    if(input.length > 254) {
        return [false, "Input must be 254 characters or less"];
    }
    return [true, input];
}


/* Validate input for the field [User_Backup_Answer:String] */
/* Requirement (1.0.13) */
function validate_Backup_Answer(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    if(input.length > 254) {
        return [false, "Input must be 254 characters or less"];
    }
    return [true, input];
}


/* Validate input for the field [User_Balance:String ex.  0.00] */
function validate_User_Balance(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    if(!/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(input)) {
        return [false, "Dollars have the following format: 1099 or 1,099 or 1,099.00 or 1099.00"];
    }
    return [true, input];
}


/* Validate input for the field [AccountSuspended:Boolean] */
function validate_Account_Suspended(input) {
    return validate_Boolean(input);
}


/* Validate input for the field [User_Phoner:String ex. "111-111-1111"] */
/* Requirement (1.0.6) */
function validate_User_Phone(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check the input for length phone numbers have 12 digits (10 numbers and two dashes)
    if(input.length != 12) {
        return [false, "Input must be 12 characters, 111-222-3333"];
    }
    // Check the input against the regex for phone numbers
    else if(!/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(input)) {
        return [false, "Phone numbers have the format 111-222-3333"];
    }
    return [true, input];
}


/* Validate input for the field [User_Email:String "xy@xy.com"] */
/* Requirement (1.0.7) */
function validate_User_Email(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check the input against the regex for emails
    if(!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(input)) {
        return [false, "Email does not have a valid format ex user@yahoo.com"];
    }
    return [true, input];
}


/* Validate input for the field [User_Belt:String - Color - "Yellow"] */
/* Requirement (1.0.9) */
function validate_User_Belt(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }

    // Check the input against the array of valid belt colors
    if(beltColors.indexOf(input) == -1) {
        return [false, "Belt colors are: Black, Blue, Yellow, Red, Green, White"];
    }
    return [true, input];
}


/* ============================================================================== */
/* ======================= BEGIN EVENT FIELD VALIDATION ========================= */
/* ============================================================================== */


/* Validate input for the field [Event_Description:String] */
function validate_Event_Description(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    if(input.length > 254) {
        return [false, "Input must be 254 characters or less"];
    }
    return [true, input];
}


/* Validate input for the field [Event_Canceled:Boolean] */
function validate_Event_Canceled(input) {
    return validate_Boolean(input);
}




/* ============================================================================== */
/* ======================= BEGIN COMMON FIELD VALIDATION ======================== */
/* ============================================================================== */


/* Validate input for the field [Event_Title:String] */
function validate_Event_Title(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    if(input.length > 100) {
        return [false, "Input must be 100 characters or less"];
    }
    return [true, input];
}


/* Validate input for the field [Address:String] */
/* Requirement (1.0.2) */
function validate_Address(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check input for max length 100
    /*if(input.length > 100) {
        return [false, "Input must be 100 characters or less"];
    }*/

    if(!/^[a-zA-Z0-9 ]+$/.test(input)) {
        return [false, "Input should only contain numbers, letters and spaces"];
    }
    return [true, input];
}


/* Validate input for the field [City:String] */
/* Requirement (1.0.3) */
function validate_City(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check input for max length 50
    if(!/^[a-zA-Z ]+$/.test(input)) {
        return [false, "Input should only contain letters"];
    }
    return [true, input];
}


/* Validate input for the field [State:String ex. "Illinois"] */
/* Requirement (1.0.4) */
function validate_State(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check against the lists of state names and abbreviations stored at the bottom of this file
    if(stateNames.indexOf(input) == -1 && stateAbbreviations.indexOf(input) == -1) {
        return [false, "Not a valid state or state abbreviation ex. IL or Illinois"]
    }
    if(stateNames.indexOf(input) != -1){
        return [true, input];
    }
    else {
        return [true, stateNames[stateAbbreviations.indexOf(input)]];
    }
}


/* Validate input for the field [Zip:String "12345"] */
/* Requirement (1.0.5) */
function validate_Zip(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Next check for length zip codes are 5 digits
    if(input.length != 5) {
        return [false, "Zip codes are 5 characters"];
    }
    // Now check against the regex for zip cods
    else if(!/^(\d{5})?$/.test(input)) {
        return [false, "Zip code not in proper format, ex. 62012"]
    }
    return [true, input];
}


// Validate input for Time field
function validateTimeFormat(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check for valid length, a time is 8 characters "mm:hh PM"
    if(input.length != 8) {
        return [false, "Input must be 8 characters"];
    }
    // Now check input against the regex for time format "MM:HH PM/AM"
    else if(!/^([1-9]|0[1-9]|1[0-2]):[0-5][0-9] ([AP][M])$/.test(input)) {
        return [false, "Time is not in valid format ex. 10:25 PM or 01:00 AM"];
    }
    return [true, input];
}


// Validate input for date format
/* Requirement (1.0.8) */
function validateDateFormat(input) {
    // Perform string validation
    if(!validateString(input)[0]) {
        return validateString(input);
    }
    // Check for valid length, a date is 10 characters "mm/dd/yyyy"
    if(input.length != 10) {
        return [false, "Input must be 10 characters"];
    }
    // Now perform the regex for date string in "mm/dd/yyyy" format
    var datesplit = input.split("/");
    if(datesplit.length != 3 || datesplit[0] < 1 || datesplit[0] > 12 ||
        datesplit[1] < 1 || datesplit[1] > 31) {
        return [false, "Input does not have correct format ex 01/02/1999"];
    }
    else {
        return [true, input];
    }
}


/* Validate a Boolean */
function validate_Boolean(input) {
    // Check input is a boolean and instantiated to true or false
    if(!(typeof input === 'boolean') || (!(input === true) && !(input === false))) {
        return [false, "Input is not a boolean"];
    } 
    else {
        return [true, input];
    }
}


/* Validate that a string is a string and not empty */
function validateString(input) {
     // Check input by type
    if(!(typeof input === 'string')) {
        return  [false, "Input is not a String"];
    }
    // Check input for empty string
    else if(input.length == 0) {
        return [false, "Input cannot be empty"];
    }
    else {
        return [true, input];
    }
}


/* Store actual copies of some of the field's valid values like state names, valid belt colors, etc */


var stateNames = [
    'Alabama','Alaska','American Samoa','Arizona','Arkansas','California',
    'Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia',
    'Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
    'Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota',
    'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
    'New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma',
    'Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota',
    'Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia',
    'Wisconsin','Wyoming'
];


var stateAbbreviations = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL',
    'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN',
    'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW',
    'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' 
];


var beltColors = [
    "Black", "Blue", "Yellow", "Red", "Green", "White"
];


module.exports = {
    validate_Account_Suspended, validate_Address, validate_Administrator, validate_Backup_Answer, validate_Backup_Question,
    validate_City, validate_Event_Canceled, validate_Event_Description, validateTimeFormat, validate_Event_Title, 
    validate_State, validate_User_Balance, validate_User_Belt, validate_User_Login, validate_User_Name, validate_User_Password,
    validate_User_Phone, validate_Zip, validate_User_Email, validate_User_Belt, validateDateFormat
}