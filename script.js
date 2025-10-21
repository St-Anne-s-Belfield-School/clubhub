import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged , signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, Timestamp} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
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
      const expiryTime = Date.now() + 14 * 24 * 60 * 60 * 1000;
      localStorage.setItem("loginExpiry", expiryTime.toString());
      alert('You will remaine logged in for two weeks, so please make sure you log out if this is a shared device!')
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
  // check expiry and login data
  const expiry = parseInt(localStorage.getItem("loginExpiry"), 10);
  const now = Date.now();
  if (now > expiry) {
    // expired: clear all login data
    localStorage.clear();
  }
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
    localStorage.setItem("isGod", "true");
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
      localStorage.clear();
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

// Calculate the date for one and a half months ago
const monthAndHalfAgo = new Date(todaysDate);
monthAndHalfAgo.setMonth(todaysDate.getMonth() - 1);
monthAndHalfAgo.setDate(monthAndHalfAgo.getDate() - 15);


  const clubsInDanger = [];

  // Loop through database items to find clubs that haven't met in the last two months
  databaseItems.forEach(club => {
    const data = club.data();
    const lastMeetingTimestamp = data.lastMeeting;

    // Convert Firestore Timestamp to JavaScript Date
    const lastMeetingDate = lastMeetingTimestamp.toDate();

    if (lastMeetingDate <= monthAndHalfAgo) {
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

export const createClubList = async function () {
  clubList = []; // clear old list

  const snapshot = await getDocs(collection(db, "clubs")); // Get all club docs

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data && data.clubName && data.username) {
      clubList.push({
        clubName: data.clubName,
        clubUsername: data.username
      });
    }
  });

  console.log("Loaded clubs into search:", clubList.length); // debug
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
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      return Promise.resolve([]);
    }
    const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
    const results = clubList.filter(club => {
      const name = club.clubName.toLowerCase();
      return queryWords.every(word => name.includes(word));
    }).map(club => ({ clubName: club.clubName, clubUsername: club.clubUsername })); // Return full objects
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
    clubInfo.innerHTML = "";
    const parentDocRef = doc(db, "clubs", adminClub);
    const clubDoc = await getDoc(parentDocRef);

    // sets header to the club name
    clubName.innerHTML = clubDoc.data().clubName;

    // builds editable club fields
    const clubData = clubDoc.data();

    function addEditableField(container, labelText, fieldKey, value, type) {
      const wrapper = document.createElement("div");
      wrapper.className = "editable-field";

      const label = document.createElement("strong");
      label.textContent = labelText + ": ";
      label.style.marginRight = "6px";

      const valueSpan = document.createElement("span");
      const displayValue =
        type === "array" && Array.isArray(value) ? value.join(", ") : (value ?? "");
      valueSpan.textContent = displayValue;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("meetingEdit");
      editBtn.style.marginRight = "6px";
      editBtn.style.fontSize = "9px";
      editBtn.style.height = "17px";
      editBtn.style.width = "40px";
      editBtn.style.borderRadius = "5px";



      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.classList.add("meetingEdit");
      saveBtn.style.marginRight = "6px";
      saveBtn.style.display = "none";
      saveBtn.style.fontSize = "9px";
      saveBtn.style.height = "17px";
      saveBtn.style.width = "40px";
      saveBtn.style.borderRadius = "5px";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.classList.add("meetingEdit");
      cancelBtn.style.marginRight = "6px";
      cancelBtn.style.display = "none";
      cancelBtn.style.fontSize = "9px";
      cancelBtn.style.height = "17px";
      cancelBtn.style.width = "40px";
      cancelBtn.style.borderRadius = "5px";

      // put buttons before label and value
      if (type !== "readonly") {
        wrapper.appendChild(editBtn);
        wrapper.appendChild(saveBtn);
        wrapper.appendChild(cancelBtn);
      }
      wrapper.appendChild(label);
      wrapper.appendChild(valueSpan);

      function enterEditMode() {
        const input =
          type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        if (type === "number") input.type = "number";
        input.style.marginLeft = "4px";
        input.value =
          type === "array" && Array.isArray(value) ? value.join(", ") : (value ?? "");

        // apply styles to inputs
        if (type === "textarea") {
          input.classList.add("recapEditBox");
        } else if (type === "number") {
          input.classList.add("attendance");
        } else {
          input.classList.add("bioEditBox");
        }

        wrapper.replaceChild(input, valueSpan);
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";

        saveBtn.onclick = async () => {
          let newVal = input.value;
          if (type === "number") {
            newVal = parseInt(newVal, 10);
            if (isNaN(newVal)) newVal = 0;
          } else if (type === "array") {
            newVal = newVal.split(",").map(s => s.trim()).filter(Boolean);
          }

          try {
            await updateDoc(doc(db, "clubs", adminClub), { [fieldKey]: newVal });
            location.reload();
          } catch (e) {
            console.error(e);
            alert("Failed to save. See console for details.");
          }
        };

        cancelBtn.onclick = () => {
          location.reload();
        };
      }

      if (type !== "readonly") {
        editBtn.onclick = enterEditMode;
      }

      container.appendChild(wrapper);
    }
    // add all fields
    addEditableField(clubInfo, "Username", "username", adminClub, "readonly");
    addEditableField(clubInfo, "Password", "password", clubData.password, "text");
    addEditableField(clubInfo, "Leaders", "clubLeaders", clubData.clubLeaders || [], "array");
    addEditableField(clubInfo, "Bio", "bio", clubData.bio, "textarea");
    addEditableField(clubInfo, "Meeting frequency", "meetingTime", clubData.meetingTime, "text");
    addEditableField(clubInfo, "Number of members", "memberCount", clubData.memberCount, "number");
    addEditableField(clubInfo, "Club Name", "clubName", clubData.clubName, "text");

    // ==== Club Level (with leaderboard migration) ====
    (function addLevelEditor() {
      const wrapper = document.createElement("div");
      wrapper.className = "editable-field";

      const label = document.createElement("strong");
      label.textContent = "Club Level: ";
      label.style.marginRight = "6px";

      const valueSpan = document.createElement("span");
      valueSpan.textContent = clubData.type || "L1";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("meetingEdit");
      editBtn.style.marginRight = "6px";
      editBtn.style.fontSize = "9px";
      editBtn.style.height = "17px";
      editBtn.style.width = "40px";
      editBtn.style.borderRadius = "5px";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.classList.add("meetingEdit");
      saveBtn.style.marginRight = "6px";
      saveBtn.style.display = "none";
      saveBtn.style.fontSize = "9px";
      saveBtn.style.height = "17px";
      saveBtn.style.width = "40px";
      saveBtn.style.borderRadius = "5px";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.classList.add("meetingEdit");
      cancelBtn.style.marginRight = "6px";
      cancelBtn.style.display = "none";
      cancelBtn.style.fontSize = "9px";
      cancelBtn.style.height = "17px";
      cancelBtn.style.width = "40px";
      cancelBtn.style.borderRadius = "5px";

      wrapper.appendChild(editBtn);
      wrapper.appendChild(saveBtn);
      wrapper.appendChild(cancelBtn);
      wrapper.appendChild(label);
      wrapper.appendChild(valueSpan);

      const PLACEHOLDER_TEXT = "the next club of this level to have a meeting will be put on this leaderboard";

      const lbIds = (lvl) => ({
        first: `${lvl}first`,
        second: `${lvl}second`,
        third: `${lvl}third`,
      });

      async function ensureLeaderboardDocs(lvl) {
        const ids = lbIds(lvl);
        const refs = [
          doc(db, "metadata", ids.first),
          doc(db, "metadata", ids.second),
          doc(db, "metadata", ids.third),
        ];
        const snaps = await Promise.all(refs.map(r => getDoc(r)));
        const ops = [];
        if (!snaps[0].exists()) ops.push(setDoc(refs[0], { clubName: PLACEHOLDER_TEXT, points: 0 }));
        if (!snaps[1].exists()) ops.push(setDoc(refs[1], { clubName: PLACEHOLDER_TEXT, points: 0 }));
        if (!snaps[2].exists()) ops.push(setDoc(refs[2], { clubName: PLACEHOLDER_TEXT, points: 0 }));
        if (ops.length) await Promise.all(ops);
      }

      async function readLeaderboard(lvl) {
        await ensureLeaderboardDocs(lvl);
        const ids = lbIds(lvl);
        const [f, s, t] = await Promise.all([
          getDoc(doc(db, "metadata", ids.first)),
          getDoc(doc(db, "metadata", ids.second)),
          getDoc(doc(db, "metadata", ids.third)),
        ]);
        return [f.data(), s.data(), t.data()];
      }

      async function writeLeaderboard(lvl, arr) {
        const ids = lbIds(lvl);
        await updateDoc(doc(db, "metadata", ids.first), { clubName: arr[0].clubName, points: arr[0].points });
        await updateDoc(doc(db, "metadata", ids.second), { clubName: arr[1].clubName, points: arr[1].points });
        await updateDoc(doc(db, "metadata", ids.third), { clubName: arr[2].clubName, points: arr[2].points });
      }

      function placeholderEntry() {
        return { clubName: PLACEHOLDER_TEXT, points: 0 };
      }

      async function removeFromLeaderboard(lvl, clubName) {
        let arr = await readLeaderboard(lvl);
        // Keep current order, remove club
        arr = arr.filter(e => (e.clubName || "") !== clubName);
        // Promote others, fill third with placeholder
        while (arr.length < 3) arr.push(placeholderEntry());
        await writeLeaderboard(lvl, arr);
      }

      async function insertIntoLeaderboard(lvl, clubName, points) {
        let arr = await readLeaderboard(lvl);
        // Include real entries only for ranking
        const real = arr.filter(e => (e.clubName || "") !== PLACEHOLDER_TEXT && (e.clubName || "") !== "");
        real.push({ clubName, points: points || 0 });
        real.sort((a, b) => (b.points || 0) - (a.points || 0));
        // Take top 3 and pad with placeholder
        let top = real.slice(0, 3);
        while (top.length < 3) top.push(placeholderEntry());
        await writeLeaderboard(lvl, top);
      }

      function enterEditMode() {
        const select = document.createElement("select");
        ["L1", "L2", "L3"].forEach(l => {
          const opt = document.createElement("option");
          opt.value = l;
          opt.textContent = l;
          select.appendChild(opt);
        });
        select.value = clubData.type || "L1";
        select.style.marginLeft = "4px";

        wrapper.replaceChild(select, valueSpan);
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";

        saveBtn.onclick = async () => {
          const newLevel = select.value;
          const oldLevel = clubData.type || "L1";
          try {
            if (newLevel !== oldLevel) {
              // Move off old leaderboard, then evaluate for new leaderboard
              await removeFromLeaderboard(oldLevel, clubData.clubName);
              await insertIntoLeaderboard(newLevel, clubData.clubName, clubData.points || 0);
              await updateDoc(doc(db, "clubs", adminClub), { type: newLevel });
            }
            location.reload();
          } catch (e) {
            console.error(e);
            alert("Failed to update level. See console for details.");
          }
        };

        cancelBtn.onclick = () => {
          location.reload();
        };
      }

      editBtn.onclick = enterEditMode;
      clubInfo.appendChild(wrapper);
    })();

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
    inDangerMessage.innerHTML =  "This club has not recorded a meeting in over a month (1.5+ months exactly)...";
  }
  else{
    InDagerNotice.innerHTML =  "Active";
    InDagerNotice.style.backgroundColor = 'rgb(71,160,37)';

    var inDangerMessage = document.createElement("h4");
    inDangerMessage.innerHTML =  "This club has met within the last two months. This means it is active and there is no cause for concern!";
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
      isAnEvent: meeting.data().isAnEvent,
      leaderNotes: meeting.data().leaderNotes ?? ""
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
      <span><strong>Leader notes:</strong> ${pastMeeting.leaderNotes ?? ""}</span>
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
  const monthAndHalfAgo = new Date(todaysDate);
  monthAndHalfAgo.setMonth(todaysDate.getMonth() - 1);
  monthAndHalfAgo.setDate(monthAndHalfAgo.getDate() - 15);

  console.log(monthAndHalfAgo);

  const lastMeetingTimestamp = clubDoc.data().lastMeeting;
  const lastMeetingDate = lastMeetingTimestamp.toDate();

  if (lastMeetingDate <= monthAndHalfAgo) {
    console.log("true");
    return true;
  } 
  else {
    console.log("false");
    return false;
  }
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


// ===== Site-wide Announcements (admin-only) =====
(() => {
  const COL = "announcements";
  const MAX_ACTIVE = 3;

  const el = {
    createBtn: document.getElementById("createAnnouncementBtn"),
    logBtn: document.getElementById("announcementLogBtn"),

    modal: document.getElementById("announcementModal"),
    modalTitle: document.getElementById("announcementModalTitle"),
    msg: document.getElementById("announcementMessage"),
    start: document.getElementById("announcementStart"),
    end: document.getElementById("announcementEnd"),
    saveBtn: document.getElementById("saveAnnouncementBtn"),
    cancelBtn: document.getElementById("cancelAnnouncementBtn"),

    logModal: document.getElementById("announcementLogModal"),
    logList: document.getElementById("announcementLogList"),
    logCloseBtn: document.getElementById("closeAnnouncementLogBtn"),
    logClearBtn: document.getElementById("clearAnnouncementLogBtn"),
  };

  if (!el.createBtn || !el.logBtn) return; // run only on god.html

  const state = { editingId: null };

  function show(node, on) { if (node) node.style.display = on ? "flex" : "none"; }
  function clearForm() {
    if (el.msg) el.msg.value = "";
    if (el.start) el.start.value = "";
    if (el.end) el.end.value = "";
    if (el.durationDays) el.durationDays.value = "";
    state.editingId = null;
    if (el.modalTitle) el.modalTitle.textContent = "New Announcement";
  }
  function nowIso() { return new Date().toISOString(); }
  function localDTtoISO(v) { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
  function isoToLocalDT(iso) {
    const d = new Date(iso); const p = n => String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function escapeHtml(str) { return (str||"").replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

  function statusOf(a, now=new Date()) {
    if (a.removed) return "removed";
    if (!a.startAt||!a.endAt) return "invalid";
    const s=new Date(a.startAt), e=new Date(a.endAt);
    if (s<=now && now<=e) return a.isActive===false?"inactive":"active";
    if (now<s) return "upcoming";
    return "expired";
  }

  async function getAll() {
    const snaps = await getDocs(collection(db,COL));
    const arr=[]; snaps.forEach(s=>arr.push({id:s.id,...s.data()}));
    return arr;
  }
  async function countActive(excludeId=null) {
    const all=await getAll(); const now=new Date();
    return all.filter(a=>{
      if(a.removed||a.isActive===false) return false;
      if(excludeId && a.id===excludeId) return false;
      if(!a.startAt||!a.endAt) return false;
      const s=new Date(a.startAt), e=new Date(a.endAt);
      return s<=now && now<=e;
    }).length;
  }
  async function create(payload) { const ref=doc(collection(db,COL)); await setDoc(ref,payload); }
  async function update(id,patch){ await updateDoc(doc(db,COL,id),patch); }
  async function remove(id){ await deleteDoc(doc(db,COL,id)); }

  async function onSave() {
    const message=(el.msg?.value||"").trim();
    if(!message){ alert("Message cannot be empty."); return; }

    let startISO=localDTtoISO(el.start?.value||"");
    let endISO=localDTtoISO(el.end?.value||"");

    if(!startISO){ alert("Start date/time is required."); return; }
    if(new Date(endISO)<new Date(startISO)){ alert("End must be after start."); return; }

    const editing=state.editingId;
    const willBeActive=(new Date(startISO)<=new Date() && new Date()<=new Date(endISO));
    if(willBeActive){ const count=await countActive(editing||null); if(count>=MAX_ACTIVE){ alert(`Max ${MAX_ACTIVE} active announcements reached.`); return; } }

    const payload={message,startAt:startISO,endAt:endISO,isActive:true,removed:false,updatedAt:Date.now(),createdAt:editing?undefined:Date.now()};
    if (editing) delete payload.createdAt;

    if(editing){ await update(editing,payload); } else { await create(payload); }

    clearForm(); show(el.modal,false); if(el.logModal && el.logModal.style.display!=="none") await renderLog();

  }

async function renderLog() {
  if (!el.logList) return;

  el.logList.innerHTML = "Loading…";
  const items = await getAll();
  const now = new Date();

  // sort by status, then by startAt desc
  const order = { active: 0, upcoming: 1, expired: 2, removed: 3, invalid: 4 };
  items.sort((a, b) => {
    const sa = order[statusOf(a, now)] ?? 9;
    const sb = order[statusOf(b, now)] ?? 9;
    if (sa !== sb) return sa - sb;
    return (b.startAt || "").localeCompare(a.startAt || "");
  });

  el.logList.innerHTML = "";

  items.forEach(a => {
    const st = statusOf(a, now); // "active" | "upcoming" | "expired" | "taken down" | "invalid"

    // card
    const wrap = document.createElement("div");
    wrap.className = "announcement-log-item";

    // message
    const msgLine = document.createElement("div");
    msgLine.innerHTML = `<strong>Message:</strong> ${escapeHtml(a.message || "")}`;

    // dates + status badge
    const datesLine = document.createElement("div");
    const s = a.startAt ? new Date(a.startAt).toLocaleString() : "—";
    const e = a.endAt ? new Date(a.endAt).toLocaleString() : "—";
    datesLine.innerHTML = `<strong>Dates:</strong> ${s} → ${e} `;

    const badge = document.createElement("span");
    badge.classList.add("badge", st); // <-- important: add status class for color
    badge.textContent = st;
    datesLine.appendChild(badge);

    // actions (Edit + Delete only)
    const actions = document.createElement("div");
    actions.classList.add("announcement-actions");

    // Only show Edit if announcement is active or upcoming
    if (st === "active" || st === "upcoming") {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("log-btn", "edit-btn");

      const delBtn = document.createElement("button");
      delBtn.textContent = "Take Down";
      delBtn.classList.add("log-btn", "delete-btn");
      editBtn.onclick = () => {
        state.editingId = a.id;
        if (el.modalTitle) el.modalTitle.textContent = "Edit Announcement";
        if (el.msg)   el.msg.value   = a.message || "";
        if (el.start) el.start.value = a.startAt ? isoToLocalDT(a.startAt) : "";
        if (el.end)   el.end.value   = a.endAt ? isoToLocalDT(a.endAt) : "";
        show(el.modal, true);
      };
      actions.appendChild(editBtn);
      delBtn.onclick = async () => {
        if (!confirm("Do you want to permanently take down this announcement?")) return;
        await update(a.id, { removed: true, updatedAt: Date.now() });
        await renderLog();
      };
      actions.appendChild(delBtn);
    }

    wrap.appendChild(msgLine);
    wrap.appendChild(datesLine);
    wrap.appendChild(actions);
    el.logList.appendChild(wrap);

  });

  
}

async function clearAnnouncementHistory() {
  if (!confirm("This will clear all past/deleted announcements and keep only current or future ones. Proceed?")) return;

  const items = await getAll();
  const now = new Date();

  // delete items that are: deleted OR invalid OR ended in the past
  const toDelete = items.filter(a => {
    if (a.removed) return true;
    if (!a.startAt || !a.endAt) return true;
    const end = new Date(a.endAt);
    return end < now; // strictly in the past gets wiped
  });

  for (const a of toDelete) {
    try { await remove(a.id); } catch (e) { /* ignore and continue */ }
  }

  await renderLog();
}


  // Wire up events
  if (el.logClearBtn) el.logClearBtn.onclick = clearAnnouncementHistory;
  el.createBtn.onclick=()=>{ clearForm(); show(el.modal,true); };
  el.cancelBtn.onclick=()=>{ clearForm(); show(el.modal,false); };
  el.saveBtn.onclick=onSave;
  el.logBtn.onclick=async()=>{ await renderLog(); show(el.logModal,true); };
  el.logCloseBtn.onclick=()=>show(el.logModal,false);
})();
