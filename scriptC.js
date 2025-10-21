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

  const clubAuth = localStorage.getItem("clubAuth");
  const isGod = localStorage.getItem("isGod");
  const loggedIn = clubAuth === "true" || isGod === "true";

  if (loggedIn) {
    if (loginBtn) loginBtn.style.display = "none";

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = function () {
        if (isGod === "true") {
          signOut(auth)
            .then(() => {
              localStorage.clear();
              location.reload();
            })
            .catch((error) => {
              console.error("Error signing out:", error);
            });
        } else {
          localStorage.clear();
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
const weekdaysContainer = document.querySelector('.weekdays'); // Row showing weekday labels
const prevButton = document.getElementById('prev'); // Button to navigate to the previous month.
const nextButton = document.getElementById('next'); // Button to navigate to the next month.



const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]; // Array of month names for display.

let currentDate = new Date(); // The date being displayed on the calendar.
currentDate.setHours(0, 0, 0, 0);

let today = new Date(); // The current date.
today.setHours(0, 0, 0, 0);

let viewMode = sessionStorage.getItem("calendarView") || "week"; // Store selected view mode

let nav = 0; // Navigation state for calendar (previous or next month)
let events = [];

// Add meetings to the `events` array
export async function addMeetings() {
    events = [];
    const databaseItems = await getDocs(collection(db, "clubs"));

    for (const item of databaseItems.docs) {
        // Get a reference to the subcollection "all-meetings"
        const meetingsCollectionRef = collection(item.ref, "all-meetings");
        const meetingDocs = await getDocs(meetingsCollectionRef);
        // Loop through meetings and extract meeting data using a for loop
        for (let i = 0; i < meetingDocs.docs.length; i++) {
            const meeting = meetingDocs.docs[i];  // Access each meeting document
            const meetingDate = meeting.data().date.toDate();
            const month = meetingDate.getMonth() + 1; // Months are 0-indexed, so add 1
            const day = meetingDate.getDate(); // Get the day of the month
            const year = meetingDate.getFullYear(); // Get the full year
            const formattedDate = `${month}/${day}/${year}`;
            const timestamp = meeting.data().date
            const date = timestamp.toDate();
            const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            const type = meeting.data().type || (meeting.data().isAnEvent ? 'Event' : 'Meeting');

            events.push({
                dateObj: meetingDate,
                date: formattedDate, // Save the date.
                title: item.data().clubName.toString(), // Save the inputted title.
                username: item.data().username,
                location: meeting.data().location,
                description: meeting.data().description,
                time: time,
                type: type,
                privateMeeting: meeting.data().privateMeeting || false
            });
        }
    }

    events.sort((a, b) => a.dateObj - b.dateObj);

    initializeViewToggle();
    renderCalendar(currentDate);
}

function initializeViewToggle() {
    const buttons = document.querySelectorAll('.view-toggle__btn');

    // set initial active state from current viewMode
    const setActive = () => {
        buttons.forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.view === viewMode);
        });
    };

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const nextView = btn.dataset.view;
            if (nextView === viewMode) return;

            // On mobile, Month is disabled. Guard here.
            const isMobile = window.matchMedia('(max-width: 700px)').matches;
            if (isMobile && nextView === 'month') return;

            viewMode = nextView;
            sessionStorage.setItem('calendarView', viewMode);
            setActive();
            renderCalendar(currentDate);
        });
    });

    //  "week-only" on small screens;  Month option on desktop
    const mql = window.matchMedia('(max-width: 700px)');

    const enforceViewportRules = () => {
        const monthBtn = document.querySelector('.view-toggle__btn[data-view="month"]');

        if (mql.matches) {
            // MOBILE: hide Month button and force Week if needed
            if (monthBtn) monthBtn.style.display = 'none';
            if (viewMode !== 'week') {
                viewMode = 'week';
                sessionStorage.setItem('calendarView', 'week');
                setActive();
                renderCalendar(currentDate);
            }
        } else {
            // DESKTOP: show Month button again
            if (monthBtn) monthBtn.style.display = '';
            setActive(); // keep classes in sync
        }
    };

    // run once after buttons exist, and on viewport changes
    enforceViewportRules();
    // modern browsers
    if (mql.addEventListener) {
        mql.addEventListener('change', enforceViewportRules);
    } else {
        // Safari < 14 fallback
        mql.addListener(enforceViewportRules);
    }
}



// Call the addMeetings function to populate events before rendering the calendar




// Renders the calendar for the given date.
// `date`: The date for which the calendar should be rendered.
function renderCalendar(date) {
    const viewIsMonth = viewMode === "month";
    const year = date.getFullYear();
    const month = date.getMonth();

    daysContainer.innerHTML = '';
    daysContainer.classList.toggle('days--week', !viewIsMonth);

    if (viewIsMonth) {
        renderMonthView({ year, month });
    } else {
        renderWeekView(date);
    }
}

function renderMonthView({ year, month }) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    monthYear.innerText = `${months[month]} ${year}`;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
        const prevMonthDate = prevMonthLastDay - i + 1;
        const dayDiv = createDayCell({
            label: prevMonthDate,
            date: new Date(year, month - 1, prevMonthDate),
            fade: true
        });
        daysContainer.appendChild(dayDiv);
    }

    for (let day = 1; day <= lastDay; day++) {
        const dateObj = new Date(year, month, day);
        const isToday = dateObj.getTime() === today.getTime();
        const dayDiv = createDayCell({
            label: day,
            date: dateObj,
            highlightToday: isToday
        });
        daysContainer.appendChild(dayDiv);
    }

    const nextMonthStartDay = 7 - new Date(year, month + 1, 1).getDay();
    for (let i = 1; i <= nextMonthStartDay; i++) {
        const dayDiv = createDayCell({
            label: i,
            date: new Date(year, month + 1, i),
            fade: true
        });
        daysContainer.appendChild(dayDiv);
    }

    weekdaysContainer.classList.remove('weekdays--hidden');
    weekdaysContainer.setAttribute('aria-hidden', 'false');
}

function renderWeekView(referenceDate) {
    const weekStart = new Date(referenceDate);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(referenceDate.getDate() - referenceDate.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(0, 0, 0, 0);

    monthYear.innerText = formatWeekHeader(weekStart, weekEnd);

    weekdaysContainer.classList.add('weekdays--hidden');
    weekdaysContainer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        currentDay.setHours(0, 0, 0, 0);
        const isToday = currentDay.getTime() === today.getTime();

        const dayDiv = createDayCell({
            label: currentDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            date: currentDay,
            highlightToday: isToday,
            enforceWidth: true,
            weekdayLabel: currentDay.toLocaleDateString(undefined, { weekday: 'short' })
        });
        daysContainer.appendChild(dayDiv);
    }
}

function createDayCell({ label, date, fade = false, highlightToday = false, enforceWidth = false, weekdayLabel = '' }) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('actualday');
    if (fade) dayDiv.classList.add('fade');
    if (highlightToday) dayDiv.classList.add('today');
    if (enforceWidth) dayDiv.classList.add('actualday--week');

    const numberSpan = document.createElement('span');
    numberSpan.className = 'day-number';
    numberSpan.textContent = label;

    if (weekdayLabel) {
        const weekdaySpan = document.createElement('span');
        weekdaySpan.className = 'day-weekday';
        weekdaySpan.textContent = weekdayLabel;
        dayDiv.appendChild(weekdaySpan);
    }

    const eventsWrap = document.createElement('div');
    eventsWrap.className = 'day-events';

    dayDiv.appendChild(numberSpan);
    dayDiv.appendChild(eventsWrap);

    attachEventsToDay({ container: dayDiv, date });

    return dayDiv;
}

function attachEventsToDay({ container, date }) {
    const filteredEvents = events.filter((event) => {
        // Access control for leaders-only (privateMeeting)
        const isGod = localStorage.getItem("isGod") === "true";        // admin
        const isLeader = localStorage.getItem("isLeader") === "true";  // logged-in user is a leader (for some club)
        const currentUsername = localStorage.getItem("username") || localStorage.getItem("club") || null;
        const isClubLeaderForThisClub = isLeader && currentUsername === event.username;

        // If the meeting is private, only show it to admins or the club's leader
        if (event.privateMeeting && (!isGod && !isClubLeaderForThisClub)) {
            return;
        }
        else {
            const eventDate = new Date(event.dateObj);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === date.getTime();
        }
    });

    filteredEvents.forEach((event) => {
        const eventDiv = document.createElement('div');

        // decide whether to show a detailed label (time | title | location)
        const isMobile = window.matchMedia('(max-width: 700px)').matches;
        const showDetailed = (viewMode === 'week') || isMobile;

        // ensure we have a clean time string (fallback to dateObj if needed)
        const timeStr = event.time || (new Date(event.dateObj)).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

        if (showDetailed || isMobile) {
            const compactLabel = `${timeStr} | ${event.title} ${event.type || 'Meeting'} | ${event.location || 'TBA'}`;
            eventDiv.setAttribute('title', compactLabel); // hover/tap fallback

            const timeLine = document.createElement('div');
            timeLine.className = 'event-line event-line--time';
            timeLine.textContent = timeStr;

            const titleLine = document.createElement('div');
            titleLine.className = 'event-line event-line--title';
            titleLine.textContent = `${event.title} ${event.type || 'Meeting'}`;

            const locationLine = document.createElement('div');
            locationLine.className = 'event-line event-line--location';
            locationLine.textContent = event.location || 'TBA';

            // Append lines in order (each will render on its own line)
            eventDiv.appendChild(timeLine);
            eventDiv.appendChild(titleLine);
            eventDiv.appendChild(locationLine);
        } 
        else {
            const label = `${event.title} ${event.type}`;
            eventDiv.textContent = label;
            eventDiv.setAttribute('title', label);
        }

        // style special event types
        if (event.type === 'Event') {
            eventDiv.classList.add('event-highlight-meeting'); // visual for public events
        }
        if (event.privateMeeting) {
            eventDiv.classList.add('leader-highlight-meeting'); // visual for leader-only meetings
        }

        eventDiv.classList.add('event');
    
        eventDiv.addEventListener('click', function () {
            sessionStorage.setItem("club", event.username);

            const infoModal = document.getElementById("eventInfoModal");

            document.getElementById("clubPopUp").innerHTML = "Club: ";
            document.getElementById("datePopUp").innerHTML = "Date: ";
            document.getElementById("timePopUp").innerHTML = "Time: ";
            document.getElementById("locationPopUp").innerHTML = "Location: ";
            document.getElementById("descriptionPopUp").innerHTML = "Description: ";

            document.getElementById("clubPopUp").innerHTML += event.title;
            document.getElementById("datePopUp").innerHTML += event.date;
            document.getElementById("timePopUp").innerHTML += event.time;
            document.getElementById("locationPopUp").innerHTML += event.location;
            document.getElementById("descriptionPopUp").innerHTML += event.description;

            infoModal.style.display = "flex";
        });

        const eventsWrapper = container.querySelector('.day-events') || container;
        eventsWrapper.appendChild(eventDiv);
    });
}

function formatWeekHeader(startDate, endDate) {
    const startMonthName = months[startDate.getMonth()];
    const endMonthName = months[endDate.getMonth()];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
        if (startMonthName === endMonthName) {
            return `${startMonthName} ${startDate.getDate()} - ${endDate.getDate()}, ${startYear}`;
        }
        return `${startMonthName} ${startDate.getDate()} - ${endMonthName} ${endDate.getDate()}, ${startYear}`;
    }

    return `${startMonthName} ${startDate.getDate()}, ${startYear} - ${endMonthName} ${endDate.getDate()}, ${endYear}`;
}

// Navigate to the previous month.
prevButton.addEventListener('click', function () {
    if (viewMode === "month") {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
        currentDate.setDate(currentDate.getDate() - 7);
    }
    renderCalendar(currentDate);
});

// Navigate to the next month.
nextButton.addEventListener('click', function () {
    if (viewMode === "month") {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
        currentDate.setDate(currentDate.getDate() + 7);
    }
    renderCalendar(currentDate);
});


console.log("ran the code");
// Initial render of the calendar.
