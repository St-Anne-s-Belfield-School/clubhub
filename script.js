import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged , signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAH3oWF9S-ePd0352Ca-TdE5cu6oinzlXo",
    authDomain: "softwareengineering-94854.firebaseapp.com",
    projectId: "softwareengineering-94854",
    storageBucket: "softwareengineering-94854.appspot.com",
    messagingSenderId: "565847408909",
    appId: "1:565847408909:web:9e116dae6ede6b965bb044"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ——————LOGIN CODE TO VERIFY THE ADMIN IS LOGED IN—————//
export const login =  function(email, password){
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      location.replace('god.html');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  }



  export const verification = async function(){
    const user = auth.currentUser;
    if (user) {
      return;
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      // ...
    } else {
      // No user is signed in.
      location.replace('login.html');
    }
  }

export const checkLogin = async function(){
  onAuthStateChanged(auth, (user) => {
    const onGodPage = window.location.pathname.includes("god.html");
    if (!user) { 
      if(onGodPage){
      // https://firebase.google.com/docs/reference/js/auth.user
            window.location.href = "login.html";
      }
      else{
        return
      }
    } 
    else{
    console.log("read !!!!!!!!!!!!!!!!!")
    sessionStorage.setItem("isGod", "true");
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn){ logoutBtn.style.display = "inline-block";}
    }
  });
}

// ——————————LOGOUT OF ADMIN ACOUNT!————————//
export function logout() {
  signOut(auth)
    .then(() => {
      // Clear all session storage items
      sessionStorage.clear();
      // Redirect to homepage or login page after log Out
      location.replace("index.html");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
    location.reload();
}

// ————————  CLUBS IN DANGER SIDE BAR LIST CODE!!!! ———— //
export const displayClubsInDanger = async function() {
  var clubsInDangerDiv = document.getElementById("clubsInDangerDiv");
  const databaseItems = await getDocs(collection(db, "clubs"));

  
  const todaysDate = new Date();
  // Calculate the date for two months ago
  const twoMonthsAgo = new Date(todaysDate);
  twoMonthsAgo.setMonth(todaysDate.getMonth() - 2);
  
  const clubsInDanger = [];
  
  // Loop through database items to find clubs that haven't met in the last two months
  databaseItems.forEach(club => {
    const data = club.data();
    const lastMeetingTimestamp = data.lastMeeting;
  
    // Convert Firestore Timestamp to JavaScript Date
    const lastMeetingDate = lastMeetingTimestamp.toDate();
  
    if (lastMeetingDate <= twoMonthsAgo) {
      clubsInDanger.push(club);
    }
  });

  // Render clubs in danger in the div
  clubsInDanger.sort((a, b) => {
    const nameA = a.data().clubName.toLowerCase();
    const nameB = b.data().clubName.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  const clubsInDangerButtonsContainer = document.getElementById("clubsInDangerButtonsContainer");
  clubsInDangerButtonsContainer.innerHTML = ""; // Clear old buttons

  clubsInDanger.forEach(club => {
    const clubInDanger = document.createElement("button");
    clubInDanger.classList.add("clubsInDangerButton");

    const span = document.createElement("span");
    span.innerHTML = club.data().clubName;

    clubInDanger.onclick = function () {
      sessionStorage.setItem("adminClub", club.data().username);
      location.reload();
    };

    clubInDanger.appendChild(span);
    clubsInDangerButtonsContainer.appendChild(clubInDanger);
  });

}

//—————————THIS IS MY SEARCH BAR CODE!!! —————————————//
// Make an empty list to store all the clubs from the database
let clubList = [];

// This function grabs the clubs from the Firestore database and adds them to the clubList array
export const createClubList = async function () {
  const databaseItems = await getDocs(collection(db, "clubs")); // Get all the club documents from Firestore
  const names = document.getElementById("clubs");
  if (names) names.innerHTML = ""; // If there's a "clubs" element, clear whatever was in it

  // Loop through all the club data we got from Firestore
  databaseItems.forEach((item) => {
    const clubName = item.data().clubName;
    const clubUsername = item.data().username;  // Get the username from Firestore
    clubList.push({ clubName, clubUsername });      // Store as object with both values
  });
};

// This class handles the instant search functionality (like a search bar that shows results as you type)
class InstantSearch {
  constructor(instantSearch, options) {
    this.options = options;
    this.elements = {
      main: instantSearch, // Main container for the search
      input: instantSearch.querySelector(".instant-search__input"), // The actual search input box
      resultsContainer: document.createElement("div") // A div to hold the search results
    };

    // Style the results container and add it under the search input
    this.elements.resultsContainer.classList.add("instant-search__results-container");
    this.elements.main.appendChild(this.elements.resultsContainer);
    this.addListeners(); // Set up the event listeners (stuff like typing and focusing)
  }

  addListeners() {
    let delay; // Used to create a little pause before running the search (so it’s not too fast)

    this.elements.input.addEventListener("input", () => {
      clearTimeout(delay); // Stop the previous timer if you're still typing
      const query = this.elements.input.value; // Get what the user typed

      // Wait 300ms before searching (like a tiny delay so we’re not searching every single keystroke)
      delay = setTimeout(() => {
        if (query.length < 1) {
          this.populateResults([]); // If the search box is empty, show nothing
          return;
        }

        // Search through the clubList and show the matching results
        this.performSearch(query).then(results => {
          this.populateResults(results);
        });
      }, 300);
    });

    // When the input is focused (clicked into), show the results box
    this.elements.input.addEventListener("focus", () => {
      this.elements.resultsContainer.classList.add("instant-search__results-container--visible");
    });

    // When you click away from the input, hide the results after a short delay
    this.elements.input.addEventListener("blur", () => {
      setTimeout(() => {
        this.elements.resultsContainer.classList.remove("instant-search__results-container--visible");
      }, 200);
    });
  }

  // This puts the search results into the DOM
  populateResults(results) {
    this.elements.resultsContainer.innerHTML = ""; // Clear any old results

    if (results.length === 0) {
      // If nothing matches the search, show a "no results" message
      const noResultDiv = document.createElement("div");
      noResultDiv.classList.add("instant-search__no-results");
      noResultDiv.textContent = "No clubs found.";
      this.elements.resultsContainer.appendChild(noResultDiv);
      return;
    }

    // If there are matches, add each one to the results container
    for (const result of results) {
      this.elements.resultsContainer.appendChild(this.createResultElement(result));
    }
  }

  createResultElement(result) {
    const anchor = document.createElement("a");
    anchor.classList.add("instant-search__result");  
    anchor.innerHTML = this.options.templateFunction(result);
  
    anchor.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      
      // Save the club username to session storage
      // Assuming 'result' has a property 'clubUsername' holding that value
      sessionStorage.setItem('adminClub', result.clubUsername);
      // Reload the current page
      location.reload();
    });
  
    return anchor;
  }
  

  // This function actually filters the clubList to find matches based on what was typed
  performSearch(query) {
    const lowerQuery = query.toLowerCase(); // Make search case-insensitive
    const results = clubList
    .filter(club => club.clubName.toLowerCase().includes(lowerQuery))
    .map(club => ({ clubName: club.clubName, clubUsername: club.clubUsername })); // Return full objects
    return Promise.resolve(results); // Return the results as a promise
  }
}

// Run this after all the clubs are loaded from the database
createClubList().then(() => {
  const searchUsers = document.querySelector("#searchUsers"); // Find the search box in the HTML
  if (searchUsers) {
    // Start the InstantSearch on that element
    new InstantSearch(searchUsers, {
      templateFunction: result => `<div class="instant-search__title">${result.clubName}</div>` // Format for each result
    });
  }
});

// ———— decided to make the admin club info box an onload 
// function cause im not going to push my luck ——————///

export async function renderAdminClubInfo() {
  var clubName = document.getElementById("adminClubName");
  clubName.innerHTML = "";
  var clubInfo = document.getElementById("adminaboutClub");

  var adminClub = sessionStorage.getItem('adminClub');
  if (adminClub) {
    clubInfo.innerHTML="";
    const parentDocRef = doc(db, "clubs", adminClub);
    const clubDoc = await getDoc(parentDocRef);
    
    // sets header to the club name
    clubName.innerHTML = clubDoc.data().clubName;
  
  var clubUsername = document.createElement("h4");
  clubUsername.innerHTML =  `<strong>Username:</strong> ${adminClub}`;

  var clubPassword = document.createElement("h4");
  clubPassword.innerHTML =  `<strong>Password:</strong> ${clubDoc.data().password}`;

  var clubBio = document.createElement("h4");
  clubBio.innerHTML =  `<strong>Bio:</strong> ${clubDoc.data().bio}`;

  var meetingPlan = document.createElement("h4");
  meetingPlan.innerHTML = `<strong>Meeting frequency:</strong> ${clubDoc.data().meetingTime}`;

  var numMembers = document.createElement("h4");
  numMembers.innerHTML = `<strong>Number of members:</strong> ${clubDoc.data().memberCount}`;

  var leaderNames = document.createElement("h4");
  leaderNames.innerHTML = `<strong>Leaders:</strong> ${clubDoc.data().clubLeaders.join(", ")}`;

  // appends created objects to the html
  clubInfo.appendChild(clubUsername);
  clubInfo.appendChild(clubPassword);
  clubInfo.appendChild(leaderNames);
  clubInfo.appendChild(clubBio);
  clubInfo.appendChild(meetingPlan);
  clubInfo.appendChild(numMembers);


  // —————RIGHT SIDE OF ADMIN CLUB INFO PAGE—————//
  var adminInDangerDiv = document.getElementById("adminInDangerDiv");
  adminInDangerDiv.innerHTML="";
  var InDagerNoticeWrapper = document.createElement("div");
  InDagerNoticeWrapper.className = "DangerNotifWrapper"
  var InDagerNotice = document.createElement("div");
  InDagerNotice.innerHTML =  "haha";
  InDagerNotice.className = "DangerNotifDiv"
  if(await isClubInDanger(adminClub)){
    InDagerNotice.innerHTML =  "Not Active";
    InDagerNotice.style.backgroundColor = 'rgba(224, 20, 37, 0.766)';
    InDagerNotice.style.color = 'white'

    var inDangerMessage = document.createElement("h4");
    inDangerMessage.innerHTML =  "This club has not met in over two months...";
  }
  else{
    InDagerNotice.innerHTML =  "Active";
    InDagerNotice.style.backgroundColor = 'rgb(71,160,37)';

    var inDangerMessage = document.createElement("h4");
    inDangerMessage.innerHTML =  "This club has met within two months. This means it is active and there is no cause for concern!";
  }

  adminInDangerDiv.appendChild(InDagerNoticeWrapper);
  InDagerNoticeWrapper.appendChild(InDagerNotice);
  adminInDangerDiv.appendChild(inDangerMessage);
  } 
  
  else {
    console.log("No adminClub set in session storage yet.");
  }
  // ————— Left side future meeting div!!!———————//
  const parentDocRef = doc(db, "clubs", adminClub);
  const clubDoc = await getDoc(parentDocRef);
  const clubID = clubDoc.id;
  const docRef = doc(db, "clubs", clubID);
  const meetingsCollectionRef = collection(docRef, "all-meetings");
  const databaseItems = await getDocs(meetingsCollectionRef);
  //push aproprate meetings to each array (past and future)
  const pastMeetings = [];
  const futureMeetings = [];
  databaseItems.forEach((meeting) => {
    // Create a meeting object with necessary data.
    let meet = {
      date: meeting.data().date.toDate(),
      description: meeting.data().description,
      meetingID: meeting.id,
      attendance: meeting.data().attendance,
      location: meeting.data().location,
      isAnEvent: meeting.data().isAnEvent
    };
    // Gets today's date to compare meetings.
    let today = new Date();
    // Check if the meeting's date is in the future or past and push to appropriate array.
    if(meet.date > today){
      futureMeetings.push(meet); // Future meeting
    }
    else{
      pastMeetings.push(meet); // Past meeting
    }
  });
  // Sort both future and past meetings by date using helper function (compareDates).
  pastMeetings.sort(compareReverseDates);
  futureMeetings.sort(compareDates);

  var nextMeet = document.getElementById("adminNextMeeting"); // Get reference to "adminNextMeeting" section.
  nextMeet.innerHTML="";
  var meetingDiv = document.createElement("div");
  var meetingInfo = document.createElement("div");
  // Add appropriate classes for styling
  meetingInfo.classList.add('meetingInfoCard');
  meetingDiv.classList.add('meetingDiv');
  meetingDiv.appendChild(meetingInfo);
  const nextMeeting = futureMeetings[0];

  if (nextMeeting) {
    let meetingType = nextMeeting.isAnEvent ? "Event" : "Meeting";
    const nextMeetingTitle = document.createElement("h3");
    nextMeetingTitle.classList.add('adminMeetingTitle')
    nextMeetingTitle.innerHTML = `Next ${meetingType}`;
    nextMeet.appendChild(nextMeetingTitle);
    
    meetingInfo.innerHTML = `
      <span><strong>Date: </strong> ${nextMeeting.date.toLocaleDateString()}</span>
      <span><strong>Time: </strong> ${nextMeeting.date.toLocaleTimeString()}</span>
      <span><strong>Location:</strong> ${nextMeeting.location}</span>
      <span><strong>Description:</strong> ${nextMeeting.description}</span>
    `;

    nextMeet.appendChild(meetingDiv);
  } 
  else {
    meetingInfo.innerHTML = `<p>No upcoming meetings found.</p>`;
    nextMeet.appendChild(meetingDiv);
    nextMeet.style.display = "flex";
    nextMeet.style.justifyContent = "center";
    meetingInfo.style.textAlign = "center";
  }

  var pastMeetingLog = document.getElementById("adminPastMeetings");
  pastMeetingLog.innerHTML = "";
  const pastMeetingsTitle = document.createElement("h3");
  pastMeetingsTitle.classList.add('adminMeetingTitle')
  pastMeetingsTitle.innerHTML = "Past Meetings";
  pastMeetingLog.appendChild(pastMeetingsTitle);
  pastMeetings.forEach((pastMeeting) => {
    var pastMeetingDiv = document.createElement("div");
    var pastMeetingInfo = document.createElement("div");
    pastMeetingInfo.classList.add('meetingInfoCard');
    pastMeetingDiv.classList.add('meetingDiv');

    var meetingType = "Meeting";
    if (pastMeeting.isAnEvent == true){
      meetingType = "Event";
    }
    // Populate meeting details for past meetings
    pastMeetingInfo.innerHTML = `
      <span><strong>Date: </strong> ${pastMeeting.date.toLocaleDateString()}</span>
      <span><strong>Time: </strong> ${pastMeeting.date.toLocaleTimeString()}</span>
      <span><strong>Location:</strong> ${pastMeeting.location}</span>
      <span><strong>Attendance:</strong> ${pastMeeting.attendance}</span>
      <span><strong>Type:</strong> ${meetingType}</span>
      <span><strong>Meeting recap:</strong> ${pastMeeting.description}</span>
    `;

    // Append the meeting div to the "meetingLog" section
    pastMeetingDiv.appendChild(pastMeetingInfo); // This was missing
    pastMeetingLog.appendChild(pastMeetingDiv);
  });
}



export async function deleteClub(){
  const confirmed = confirm("Are you sure you want to delete this club? It will be removed FOREVER!!!");
  const clulbUser = sessionStorage.getItem("adminClub");
    if (confirmed) {
      const doubleConfirmed = confirm("Are you 100% sure?");
  
      if (doubleConfirmed) {
        await deleteDoc(doc(db, "clubs", clulbUser));
        location.reload();
      };
  };
}

export function goToClub(){
    const clulbUser = sessionStorage.getItem("adminClub");
  sessionStorage.setItem("club", clulbUser);
  location.replace('clubDash.html');
}

// ————— Helper Function for displeying the meeting info ————//
async function isClubInDanger(username) {
  const parentDocRef = doc(db, "clubs", username);
    const clubDoc = await getDoc(parentDocRef);

  const todaysDate = new Date();
  const twoMonthsAgo = new Date(todaysDate);
  twoMonthsAgo.setMonth(todaysDate.getMonth() - 2);

  const lastMeetingTimestamp = clubDoc.data().lastMeeting;
  const lastMeetingDate = lastMeetingTimestamp.toDate();
  
  if (lastMeetingDate <= twoMonthsAgo) {
    console.log("true");
    return true;
  }

  console.log("False");
  return false;
}

// Helper function(s): 
function compareDates(meetingA, meetingB) {
  return new Date(meetingA.date) - new Date(meetingB.date);
}

function compareReverseDates(meetingA, meetingB) {
  return new Date(meetingB.date) - new Date(meetingA.date);
}

export async function resetPoints(){

  const confirmed = confirm("Are you sure you want reset points?");
  
    if (confirmed) {
      const doubleConfirmed = confirm("Are you super sure?");
      if(doubleConfirmed) {

        await updateDoc(doc(db, "metadata", "L2first"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        await updateDoc(doc(db, "metadata", "L2second"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        await updateDoc(doc(db, "metadata", "L2third"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        await updateDoc(doc(db, "metadata", "L3first"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        await updateDoc(doc(db, "metadata", "L3second"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        await updateDoc(doc(db, "metadata", "L3third"), {
          clubName: "No Club has > 0 points",
          points: 0,
        });
        // Resettting points in LB
        const databaseItems = await getDocs(collection(db, "clubs"));

        for (const item of databaseItems.docs) {
          const clubRef = doc(db, "clubs", item.id);
          await updateDoc(clubRef, {
            points: 0
          });
        } 
      }
    }
}
