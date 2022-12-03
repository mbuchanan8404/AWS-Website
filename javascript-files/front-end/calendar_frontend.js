///////////////////////////////////////////////////////////////////////////////////////
 /////////////////////////////// Calendar Generator ///////////////////////////////// 
  /////////////////////////////////////////////////////////////////////////////////


/* This module dynamically generates the calendar page's table and displays events */


/*  Requirements
    4.0.0
    4.1.0
    4.2.0
    4.3.0
*/


import {displayHeaderElements} from './handler_frontend.js';
import {logout} from './logout_frontend.js';


/* Month currently displayed by the calendar */
var displayMonth = new Date().getMonth();


// Track if the user has pressed next month or previous month enough times to roll over the year
var changeYear = 0;


/* Variable to keep track of which day the user last selected */
var selectedDay = null;


/* Get the table element from the html page */
var calendar = document.getElementById('calendarTable');
calendar.className = 'calendar';


/* Load header elements for account page */
/* Requirement (4.0.0) */
async function onLoadPage(){
    await displayHeaderElements("calendar");
    await getEvents();
    buildCalendar(changeYear);
    buildHourlyDisplay();
}


/* Implement logout button functionality */
/* Requirement (8.2.0) */
function onLogout(){
    logout();
}


/* Store some data about months and holidays */
var data = {
    "month": [
            {"name":"January", "days":31}, 
            {"name":"February", "days":28}, 
            {"name":"March", "days":31},
            {"name":"April", "days":30}, 
            {"name":"May", "days":31}, 
            {"name":"June", "days":30},
            {"name":"July", "days":31}, 
            {"name":"August", "days":31}, 
            {"name":"September", "days":30},
            {"name":"October", "days":31}, 
            {"name":"November", "days":30}, 
            {"name":"December", "days":31}
    ],

    "holidays": [
            [ {"date":1, "event":"New Year's Day"}, {"date":16, "event":"Martin Luther King Jr. Day"}, {"date":20,"event":"Inauguration Day"} ],
            [ {"date":2, "event":"Groundhog Day"}, {"date":14, "event":"Valentine's Day"}, {"date":20, "event":"President's Day"} ],
            [ {"date":12, "event":"Daylight Saving Time"}, {"date":17, "event":"St Patrick's Day"} ],
            [ {"date":1, "event":"April Fools' Day"}, {"date":16, "event":"Easter"}, {"date":18, "event":"Tax Day"}, {"date":22, "event":"Earth Day"} ],
            [ {"date":14, "event":"Mother's Day"}, {"date":29, "event":"Memorial Day"} ],
            [ {"date":14, "event":"Flag Day"}, {"date":18, "event":"Father's Day"} ],
            [ {"date":4, "event":"Independence Day"} ],
            [ ],
            [ {"date":4, "event":"Labor Day"}, {"date":16, "event":"Easter"}, {"date":18, "event":"Tax Day"}, {"date":22, "event":"Earth Day"} ],
            [ {"date":9, "event":"Columbus Day"}, {"date":31, "event":"Halloween"} ],
            [ {"date":5, "event":"Dalylight Saving Time End"}, {"date":7, "event":"Election Day"}, {"date":10, "event":"Veterans Day (Observed)"}, {"date":11, "event":"Veterans Day"}, {"date":24, "event":"Thanksgiving"} ],
            [ {"date":25, "event":"Christmas Day"} ]
    ]
}


/* Store events for the current user's invites from the database on page load */
var events = [];
/* (Requirement 4.2.0) */
async function getEvents() {
    const pageURL = '/calendar/getEvents/';
    const res = await fetch(pageURL,{method:'GET'});
    var result = await res.json();
    events.push(...result.Items);
}


/* Build the calendar */
/* (Requirement 4.1.0) */
function buildCalendar(changeYear) {
    calendar.innerHTML = '';

    // Store some numbers for the calendar
    var weekDay = 0;
    var monthDay = 1;
    var daysInAWeek = 7;

    // Get calendar data for the current month.
    var curDate = new Date();
    if(changeYear != 0) { // account for the user rolling over the year while pressing next/previous
        curDate.setFullYear(curDate.getFullYear() + changeYear)
    }
    var curYear = curDate.getFullYear();
    var curMonth = curDate.getMonth();
    var today = curDate.getDate();

    // Make correction to number of days in February for LEAP YEARS
    if(curYear % 4 == 0) {
        data.month[1].days = 29;
    }
    else {
        data.month[1].days = 28;
    }

    // Build current month's calendar page data.
    var firstOfTheMonthDate = new Date(curYear, displayMonth, 1);
    var startDay = firstOfTheMonthDate.getDay();
    var monthName = data.month[displayMonth].name;
    var daysInMonth = data.month[displayMonth].days;

    // Empty string to hold the dynamically generated html of the table/calendar
    var c = '';

    // First generate the caption for the table
    function generateTableCaption() {
        var previousButton = '<button id="previous">&#8678; Prev</button>';
        var nextButton = '<button id="next">Next &#8680;</button>';
        c += '<table>';
        c += '<caption id="title">' + previousButton + '<button id ="captionDate" disabled>' + monthName + ' ' + curYear + '</button>' + nextButton + '</caption>';
        c += '<thead><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead>';
        c += '<tbody>';
    }

    // Generate the first row of dates
    function generateFirstRow() {
        // Get last months last days for the first row
        var numberOfDaysInLastMonth = 0;
        if(displayMonth == 1) {
            numberOfDaysInLastMonth = new Date(curYear - 1, 12, 0).getDate();
        } 
        else {
            numberOfDaysInLastMonth = new Date(curYear, displayMonth, 0).getDate();
        }
        c += '<tr>';
        for (weekDay = 0; weekDay <= daysInAWeek - 1; weekDay++) {
            if(weekDay < startDay)  {
                c += '<td class="lastMonthsDays"><div class="calendarDayNumber">' + (numberOfDaysInLastMonth - startDay + (weekDay + 1)) +
                 '</div><div class="calendarDayText"></div></td>';
            }
            else { 
                c += '<td id="b' + monthDay + '"><div class="calendarDayNumber">' + monthDay + '</div><div class="calendarDayText"></div></td>'; 
                monthDay += 1;
            }
        }
        c += '</tr>';
    }

    // Generate all remaining rows of dates
    function generateFullRows() {
        for (monthDay = monthDay; monthDay <= daysInMonth; monthDay++) {
            if (weekDay == 0) { 
                c += '<tr>';
            }
            else if (weekDay == daysInAWeek) {
                c += '</tr>'; 
            }
            c += '<td id="b' + monthDay + '"><div class="calendarDayNumber">' + monthDay + '</div><div class="calendarDayText"></div></td>';
            weekDay = (weekDay + 1) % daysInAWeek;
        }
    }

    // Generate last row of empty dates
    function generateLastRow() {
        // add next months last days for the last row
        var i = 1;
        if (weekDay != 0) {
            for (weekDay = weekDay; weekDay <= daysInAWeek - 1; weekDay++) {
                c += '<td class="nextMonthsDays"><div class="calendarDayNumber">' + i + '</div><div class="calendarDayText"></div></td>';
                i++;
            }
        }
        c += '</tbody>';
        c += '</table>';
    }

    // Add the tooltips to the special days and events, and mark today's date.
    function addSpecialDays() {
        var currentEvents = data.holidays[displayMonth];
        var elEventCell = null;
        // add holidays
        for (var eventKey in currentEvents) {
            elEventCell = document.getElementById('b' + currentEvents[eventKey].date);
            elEventCell = elEventCell.getElementsByClassName('calendarDayText');
            elEventCell = elEventCell[0];
            elEventCell.innerHTML = currentEvents[eventKey].event + '\n';
            elEventCell = document.getElementById('b' + currentEvents[eventKey].date);
            elEventCell.className = "special-day";
        }
        var elEventCell = null;
        // add events
        for (var event in events) {
            if(parseInt(events[event].Event_Date.split('/')[0]) - 1 == displayMonth &&
                parseInt(events[event].Event_Date.split('/')[2]) == curYear) {
                elEventCell = document.getElementById('b' + parseInt(events[event].Event_Date.split('/')[1]));
                elEventCell = elEventCell.getElementsByClassName('calendarDayText');
                elEventCell = elEventCell[0];
                elEventCell.innerHTML +=  events[event].Event_Title + '\n';
                elEventCell = document.getElementById('b' + parseInt(events[event].Event_Date.split('/')[1]));
                elEventCell.title += events[event].Event_Title + '<br>';
                elEventCell.title += events[event].Event_Start_Time + '<br>';
                elEventCell.title += events[event].Event_End_Time + '<br>';
                elEventCell.title += events[event].Event_Description + '/';
                elEventCell.className = "event";
            }

        }
        var elEventCell = null;
        // mark the current day
        if (displayMonth == curMonth && changeYear == 0) { 
            document.getElementById('b' + today).classList.add('today'); 
        }

        // Finally, add special days to last months and next months grayed out days
        let lm = document.getElementsByClassName('lastMonthsDays');
        let nm = document.getElementsByClassName('nextMonthsDays');
        if(lm[0]) {
            if(displayMonth > 0) {
                var currentEvents = data.holidays[displayMonth - 1];
            }
            else {
                var currentEvents = data.holidays[11];
            }
            for (let holiday in currentEvents) {
                for(let i = 0; i < lm.length; i++) {
                    if(currentEvents[holiday].date == lm[i].firstChild.innerHTML) {
                        lm[i].lastChild.innerHTML += currentEvents[holiday].event + '\n';
                    }
                }
            }
        }
        if(nm[0]) {
            if(displayMonth < 11) {
                var currentEvents = data.holidays[displayMonth + 1];
            }
            else {
                var currentEvents = data.holidays[0];
            }
            for (let holiday in currentEvents) {
                for(let i = 0; i < nm.length; i++) {
                    if(currentEvents[holiday].date == nm[i].firstChild.innerHTML) {
                        nm[i].lastChild.innerHTML += currentEvents[holiday].event + '\n';
                    }
                }
            }
        }
        let month = displayMonth + 1;
        if(month == 1) {
            month = 12;
        }
        else{
            month--;
        }
        let year = new Date().getFullYear() + changeYear;
        if(month == 12){
            year--;
        }
        for(var event in events) {
            for(let i = 0; i < lm.length; i++) {
                if(events[event].Event_Date.split('/')[0] == month && events[event].Event_Date.split('/')[2] == year &&
                   events[event].Event_Date.split('/')[1] == lm[i].firstChild.innerHTML) {
                    lm[i].lastChild.innerHTML += events[event].Event_Title + '\n';
                }
            }
        }
        month = displayMonth + 1;
        if(month == 12) {
            month = 1;
        }
        else {
            month++;
        }
        year = new Date().getFullYear() + changeYear;
        if(month == 1) {
            year++;
        }
        for(var event in events) {
            for(let i = 0; i < nm.length; i++) {
                if((events[event].Event_Date.split('/')[0] == month && events[event].Event_Date.split('/')[2] == year &&
                    events[event].Event_Date.split('/')[1] == + '0' + nm[i].firstChild.innerHTML)) {
                    nm[i].lastChild.innerHTML += events[event].Event_Title + '\n';
                }
            }
        }
    }

    // call the functions to build the calendar
    generateTableCaption();
    generateFirstRow();
    generateFullRows();
    generateLastRow();

    // Update the page with the newly built calendar
    calendar.innerHTML += c;

    // Add holidays and events to the calendar
    addSpecialDays();

    // Add the selected day if one is saved
    if(selectedDay && selectedDay.month == displayMonth && selectedDay.year == changeYear) {
        document.getElementById(selectedDay.day).classList.add('selectedDay');
    }
    // If not, treat current day as selected day
    else if(!selectedDay && document.getElementsByClassName('today')[0]) {
        buildHourlyDisplay();
    }

    // Register the button events each time the table is rebuilt.
    document.getElementById('previous').addEventListener('click', buildPreviousMonth, false);
    document.getElementById('next').addEventListener('click', buildNextMonth, false);
    for(var i = 0; i < data.month[displayMonth].days; i++) {
        var id = 'b' + parseInt(i + 1);
        document.getElementById(id).addEventListener('click', buildHourlyDisplay, false);
    }
}


/* When the user presses the previous button, build previous month */
/* (Requirement 4.3.0) */
function buildPreviousMonth() {
    
    if(displayMonth == 0) {
        changeYear -= 1;
        displayMonth = (displayMonth - 1 + 12) % 12;
        buildCalendar(changeYear);  
    }
    else {
        displayMonth = (displayMonth - 1 + 12) % 12;
        buildCalendar(changeYear);
    }   
}


/* When the user presses the next button, build next month */
/* (Requirement 4.3.0) */
function buildNextMonth() {
    if(displayMonth == 11) {
        changeYear += 1;
        displayMonth = (displayMonth + 1) % 12;
        buildCalendar(changeYear)
    }
    else {
        displayMonth = (displayMonth + 1) % 12;
        buildCalendar(changeYear);
    }
}


/* Build table to display the current day's events */
/*  Requirement
    4.2.0
*/
function buildHourlyDisplay() {
// First mark the selected date on the calendar and unmark previous selected day
    if(this) {
        if(selectedDay && this.id == selectedDay.day && displayMonth == selectedDay.month && changeYear == selectedDay.year) {
            this.classList.remove('selectedDay');
            selectedDay = null;
        }
        else {
            if(selectedDay) {
                let temp = document.getElementsByClassName('selectedDay');
                if(temp[0]) {
                    temp[0].classList.remove('selectedDay');
                }
            }
            else{
                selectedDay = {day:-1,month:-1,year:-1};
            }
            this.classList.toggle('selectedDay');
            selectedDay.day = this.id;
            selectedDay.month = displayMonth;
            selectedDay.year = changeYear;
        }
    }
    else if(document.getElementsByClassName('today')[0] && !selectedDay) {
        document.getElementsByClassName('today')[0].classList.add('selectedDay');
        selectedDay = {day:-1,month:-1,year:-1};
        selectedDay.day = document.getElementsByClassName('today')[0].id;
        selectedDay.month = displayMonth;
        selectedDay.year = changeYear;
    }

    // Start building the hourly display for the selected day
    // First just build a time sheet
    var dynamicHourlyDisplay = '<table id="hourlyDisplayTable"><tbody>';
    for(var i = 0; i < 24; i++) {
        var hour = '';
        var meridian = '';
        if((i % 12) == 0) {
            hour = '12';   
        }
        else {
            if((i % 12) < 10) {
                hour = '0' + (i % 12);
            }
            else {
                hour = i % 12;
            }
        }
        if(i < 12) {
            meridian = ' AM';
        }
        else {
            meridian = ' PM';
        }
        dynamicHourlyDisplay += '<tr id="' + hour + ':00' + meridian + '"><th class="timeLabel">'; // give the row an id based on time
        dynamicHourlyDisplay += hour + ':00' + meridian;
        dynamicHourlyDisplay += '</th></tr>';
        for(var j = 1; j <= 1; j++) {
            dynamicHourlyDisplay += '<tr id="' + hour + ':' + (j * 30) + meridian + '"><th class="timeLabel">'; // give the row an id based on time
            dynamicHourlyDisplay += '</th></tr>';
        }
    }
    dynamicHourlyDisplay += '</tbody></table>';
    
    // Send the results to the browser
    document.getElementById('hourlyDisplayTableContainer').innerHTML = dynamicHourlyDisplay;

    // If no day is selected then we are done
    if(!selectedDay) {
        return;
    }

    // Now we'll add the events to the time sheet table
    var eventsCurrentlyInHourlyDisplay = [];
    var eventsForTheDay = document.getElementById(selectedDay.day).title.split('/');
    var timeSheet = document.getElementById('hourlyDisplayTable');
    var rowList = timeSheet.querySelectorAll('tr');
    for(var i = 0; i < rowList.length; i++) {
        for(var j = 0; j < eventsForTheDay.length; j++) {
            if(eventsForTheDay[j] != '') {
                // To display multiple events for the same time frame, we need to make sure we don't overwrite into the same <td>
                // Get the length of the event we're going to write to the time sheet
                var eventLength = differenceBetweenTimeStamps(convertTimeStampBack(eventsForTheDay[j].split('<br>')[2]), 
                                    convertTimeStampBack(eventsForTheDay[j].split('<br>')[1]))/30.00;

                // Write the event to the hourly display
                if(compareTimeStamps(rowList[i].id, eventsForTheDay[j].split('<br>')[1]) || areTimeStampsEqual(rowList[i].id, eventsForTheDay[j].split('<br>')[1])) { 
                    if(compareTimeStamps(eventsForTheDay[j].split('<br>')[2], rowList[i].id)) {
                        if(!eventsCurrentlyInHourlyDisplay.includes(eventsForTheDay[j])) { // if the event isn't already displayed
                            rowList[i].appendChild(document.createElement('td')); // step over all columns and create a <td>
                            rowList[i].lastChild.rowSpan = eventLength; // span the right number of rows for the event length
                            rowList[i].lastChild.appendChild(document.createElement('div')); // stick the event in a div for css
                            rowList[i].lastChild.lastChild.classList.add('eventInTimeSheet'); // add css class
                            rowList[i].lastChild.lastChild.innerHTML = eventsForTheDay[j]; // add the event itself to the page
                            eventsCurrentlyInHourlyDisplay.push(eventsForTheDay[j]); // Add the event to the list of events currently displayed
                        }
                    }
                }
            }
        }
    }
    if(document.getElementsByClassName('eventInTimeSheet').length > 0) {
        document.getElementsByClassName('eventInTimeSheet')[0].parentNode.scrollIntoView(); // scroll the time sheet to the first event automatically
    }
}


/* Function to find the difference between two timestamps in format hh:mm t1 - t2 */
function differenceBetweenTimeStamps(t1, t2) {
    var hourDifference = t1.split(':')[0] - t2.split(':')[0];
    var minuteDifference = t1.split(':')[1] - t2.split(':')[1];
    var finalDifference = hourDifference * 60;
    finalDifference = minuteDifference + finalDifference;
    return finalDifference;
}


/* Function to convert a timestamp from hh:mm AM/PM to hh:mm */
function convertTimeStampBack(t) {
    var hour = t.split(':')[0];
    var minute = t.split(':')[1];
    var newMinute = minute.split(' ')[0];
    var meridian = t.split(' ')[1];
    var newHour = -1;
    var returnString = '';
    if(meridian == 'AM') {
      newHour = hour;
    }
    else {
      newHour = parseInt(hour) + 12;
    }
    returnString += newHour + ':' + newMinute;
    return returnString;
  }
  

/* Function to compare two timestamps for equality t1 == t2 */
function areTimeStampsEqual(t1, t2) {
    if(!compareTimeStamps(t1, t2) && !compareTimeStamps(t2, t1)) { // if t1 !> t2 and t2 !> t1 then t1 == t2
        return true;
    }
    else {
        return false;
    }
}


/* Function to compare two timestamps from the database in format '09:30 AM', finds if t1 > t2 */
function compareTimeStamps(t1, t2) {
    var temp1 = '', temp2 = '', t1Meridian = '', t2Meridian = '', t1Hour = '', t2Hour = '', t1Minute = '', t2Minute = '';
    t1Meridian = t1.split(' ')[1];
    t2Meridian = t2.split(' ')[1];
    // First compare AM/PM values
    if(t1Meridian > t2Meridian) {
        return true;
    }
    else if(t1Meridian < t2Meridian) {
        return false;
    }
  
    // The two times have the same AM/PM value, compare hour values
    t1Hour = t1.split(':')[0];
    t2Hour = t2.split(':')[0];
    if((t1Hour % 12) > (t2Hour % 12)) {
        return true;
    }
    else if((t1Hour % 12) < (t2Hour % 12)) {
        return false;
    }
  
    // The two times have the same AM/PM value AND same hour value, compare minute values
    temp1 = t1.split(' ');
    t1Minute = temp1[0].split(':')[1];
    temp2 = t2.split(' ');
    t2Minute = temp2[0].split(':')[1];
    if(t1Minute > t2Minute) {
        return true; // t1 > t2
    }
    else {
        return false; // t1 !> t2
    }
}


//Set scope of methods to window so html documents can access
window.onLoadPage = onLoadPage;
window.onLogout = onLogout;


