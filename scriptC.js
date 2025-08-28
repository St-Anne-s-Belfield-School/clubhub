import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAH3oWF9S-ePd0352Ca-TdE5cu6oinzlXo",
    authDomain: "softwareengineering-94854.firebaseapp.com",
    projectId: "softwareengineering-94854",
    storageBucket: "softwareengineering-94854.appspot.com",
    messagingSenderId: "565847408909",
    appId: "1:565847408909:web:9e116dae6ede6b965bb044"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Nav bar editing function based on users status (admin, club, not logged in)
export function correctNavDisplay() {
  const loginBtn = document.getElementById("login");
  const logoutBtn = document.getElementById("logout");
  const adminBtn = document.getElementById("adminPageBtn");

  const clubAuth = sessionStorage.getItem("clubAuth");
  const isGod = sessionStorage.getItem("isGod");
  const loggedIn = clubAuth === "true" || isGod === "true";

  if (loggedIn) {
    if (loginBtn) loginBtn.style.display = "none";

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = function () {
        if (isGod === "true") {
          signOut(auth)
            .then(() => {
              sessionStorage.clear();
              location.reload();
            })
            .catch((error) => {
              console.error("Error signing out:", error);
            });
        } else {
          sessionStorage.clear();
          location.reload();
        }
      };
    }

    if (isGod === "true" && adminBtn) adminBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (adminBtn) adminBtn.style.display = "none";
  }
}



// Calendar setup
const monthYear = document.getElementById('month-year'); // Displays the current month and year.
const daysContainer = document.getElementById('days'); // Container for the calendar days.
const prevButton = document.getElementById('prev'); // Button to navigate to the previous month.
const nextButton = document.getElementById('next'); // Button to navigate to the next month.



const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]; // Array of month names for display.

let currentDate = new Date(); // The date being displayed on the calendar.
let today = new Date(); // The current date.

let nav = 0; // Navigation state for calendar (previous or next month)
let events = [];

// Add meetings to the `events` array
export async function addMeetings() {
    const databaseItems = await getDocs(collection(db, "clubs"));


    for (const item of databaseItems.docs) {
        // Get a reference to the subcollection "all-meetings"
        const meetingsCollectionRef = collection(item.ref, "all-meetings");
        // console.log(item.data().clubName);
        const meetingDocs = await getDocs(meetingsCollectionRef);
        // console.log(meetingDocs);
        // Loop through meetings and extract meeting data using a for loop
        for (let i = 0; i < meetingDocs.docs.length; i++) {
            const meeting = meetingDocs.docs[i];  // Access each meeting document
            // Convert Firestore timestamp to a what it is reading as the date format...
            const meetingDate = meeting.data().date.toDate();
            // get the month, day, and year from the Date object
            const month = meetingDate.getMonth() + 1; // Months are 0-indexed, so add 1
            const day = meetingDate.getDate(); // Get the day of the month
            const year = meetingDate.getFullYear(); // Get the full year
            // Format the date as month/day/year
            const formattedDate = `${month}/${day}/${year}`;
            // console.log(formattedDate); // Log the formatted date
            const timestamp = meeting.data().date
            const date = timestamp.toDate();
            const time = date.toLocaleTimeString();
            events.push({
                date: formattedDate, // Save the date.
                title: item.data().clubName.toString(), // Save the inputted title.
                username: item.data().username,
                location: meeting.data().location,
                description: meeting.data().description,
                time: time,
                username: item.data().username
            });

        }
    }

    renderCalendar(currentDate); 
}


// Call the addMeetings function to populate events before rendering the calendar




// Renders the calendar for the given date.
// `date`: The date for which the calendar should be rendered.
function renderCalendar(date) {

    const year = date.getFullYear(); // Extract the year.
    const month = date.getMonth(); // Extract the month.
    const firstDay = new Date(year, month, 1).getDay(); // Get the weekday of the first day of the month.
    const lastDay = new Date(year, month + 1, 0).getDate(); // Get the total days in the month.

    monthYear.innerText = `${months[month]} ${year}`; // Update the month and year display.
    daysContainer.innerHTML = ''; // Clear previous calendar rendering.

    // Add dates from the previous month for context.
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
        const dayDiv = document.createElement('div');
        const prevMonthDate = prevMonthLastDay - i + 1; // Previous month's date.
        dayDiv.innerText = prevMonthDate;
        dayDiv.classList.add('actualday');
        dayDiv.classList.add('fade'); // Dim styling for non-current dates.

        // Create the correct day string for the previous month (month - 1).
        const dayString = `${month}/${prevMonthDate}/${year}`; // month-1 for previous month

        daysContainer.appendChild(dayDiv);

    // Filter events to only include those matching the current day (dayString)
    const eventForDay = events.filter(e => e.date === dayString);

    // Iterate through all matching events for the day
    eventForDay.forEach(event => {
        // Create a new <div> to represent the event
        const eventDiv = document.createElement('div');

        // Set the text of the event div to the event title followed by "meeting"
        eventDiv.innerText = `${event.title} meeting`;

        // Add a CSS class for styling the event div
        eventDiv.classList.add('event');

        // Add a click event listener to show detailed info when the event is clicked
        eventDiv.addEventListener('click', function () {
            // console.log('meeting info box called!');

            // Store the event's username (e.g., club name) in sessionStorage for access across pages
            sessionStorage.setItem("club", event.username);

            // Get the modal element that will display event details
            const infoModal = document.getElementById("eventInfoModal");

            //Cear out modal 
            document.getElementById("clubPopUp").innerHTML = "Club: ";
            document.getElementById("datePopUp").innerHTML = "Date: ";
            document.getElementById("timePopUp").innerHTML = "Time: ";
            document.getElementById("locationPopUp").innerHTML = "Location: ";
            document.getElementById("descriptionPopUp").innerHTML = "Description: ";

            // Fill in the modal with event details
            document.getElementById("clubPopUp").innerHTML += event.title;
            document.getElementById("datePopUp").innerHTML += event.date;
            document.getElementById("timePopUp").innerHTML += event.time;
            document.getElementById("locationPopUp").innerHTML += event.location;
            document.getElementById("descriptionPopUp").innerHTML += event.description;

            // Show the modal (assumes flex display for centering)
            infoModal.style.display = "flex";

            // Log the full event object to the console for debugging
            //console.log(event);
        });

        // Append the newly created event div to the current day's container (dayDiv)
        dayDiv.appendChild(eventDiv);
    });

    }

    // Add dates for the current month.
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        const dayString = `${month + 1}/${i}/${year}`;
        //console.log("dayString")
        //console.log(dayString)
        dayDiv.innerText = i; // Current month's date.
        dayDiv.classList.add('actualday');

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today'); // Highlight today's date.
        }

        const eventForDay = events.filter(e => e.date === dayString);
        eventForDay.forEach(event => { // Iterate through all matching events

            const eventDiv = document.createElement('div');
            eventDiv.innerText = `${event.title} meeting`; // Display the event title + write meeting @ end
            eventDiv.classList.add('event');
            // Add a click event listener to the event div
            eventDiv.addEventListener('click', function () {
                // Log to console that the modal is being triggered (for debugging)
                //console.log('meeting info box called!');

                // Store the event's username (used as a club identifier) in session storage
                // This allows access to the club's data on other pages or after navigation
                sessionStorage.setItem("club", event.username);

                // Get the modal element where event details will be displayed
                const infoModal = document.getElementById("eventInfoModal");

                //Cear out modal 
                document.getElementById("clubPopUp").innerHTML = "Club: ";
                document.getElementById("datePopUp").innerHTML = "Date: ";
                document.getElementById("timePopUp").innerHTML = "Time: ";
                document.getElementById("locationPopUp").innerHTML = "Location: ";
                document.getElementById("descriptionPopUp").innerHTML = "Description: ";
                
                // Populate the modal's fields with the selected event's information
                // Using += appends text — be cautious if you don’t want to accumulate content on repeated clicks
                document.getElementById("clubPopUp").innerHTML += event.title;         // Club name/title
                document.getElementById("datePopUp").innerHTML += event.date;         // Event date
                document.getElementById("timePopUp").innerHTML += event.time;         // Event time
                document.getElementById("locationPopUp").innerHTML += event.location; // Event location
                document.getElementById("descriptionPopUp").innerHTML += event.description; // Event description

                // Make the modal visible using flex display
                infoModal.style.display = "flex";

                // Log the full event object to the console (useful for debugging)
                //console.log(event);
            });
            dayDiv.appendChild(eventDiv); // Append the event to the day div
        });

        daysContainer.appendChild(dayDiv);
    }

    // Add dates for the next month for context.
    const nextMonthStartDay = 7 - new Date(year, month + 1, 1).getDay(); // Correct next month start day calculation
    for (let i = 1; i <= nextMonthStartDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i; // Next month's date.
        dayDiv.classList.add('fade'); // Dim styling for non-current dates.
        dayDiv.classList.add('actualday');

        // Create the correct day string for the next month ..
        const dayString = `${month + 2}/${i}/${year}`; // month + 2 for next month

        const eventForDay = events.filter(e => e.date === dayString);
        eventForDay.forEach(event => { // Iterate through all matching events
            const eventDiv = document.createElement('div');
            eventDiv.innerText = `${event.title} meeting`; // Display the event title + write meeting @ end
            eventDiv.classList.add('event');
            eventDiv.addEventListener('click', function () {
                //console.log('meeting info box called!')

                //Cear out modal 
                document.getElementById("clubPopUp").innerHTML = "Club: ";
                document.getElementById("datePopUp").innerHTML = "Date: ";
                document.getElementById("timePopUp").innerHTML = "Time: ";
                document.getElementById("locationPopUp").innerHTML = "Location: ";
                document.getElementById("descriptionPopUp").innerHTML = "Description: ";
            
                // clubID should be the name of the club
                sessionStorage.setItem("club", event.username);
                const infoModal = document.getElementById("eventInfoModal");
                document.getElementById("clubPopUp").innerHTML += event.title;
                document.getElementById("datePopUp").innerHTML += event.date;
                document.getElementById("timePopUp").innerHTML += event.time;
                document.getElementById("locationPopUp").innerHTML += event.location;
                document.getElementById("descriptionPopUp").innerHTML += event.description;
                infoModal.style.display = "flex";
                //console.log(event);
            });
            dayDiv.appendChild(eventDiv); // Append the event to the day div
        });

        daysContainer.appendChild(dayDiv);
    }
}


// Navigate to the previous month.
prevButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() - 1); // Decrease the month.
    renderCalendar(currentDate); // Re-render the calendar.
});

// Navigate to the next month.
nextButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() + 1); // Increase the month.
    renderCalendar(currentDate); // Re-render the calendar.
});


console.log("ran the code");
// Initial render of the calendar.