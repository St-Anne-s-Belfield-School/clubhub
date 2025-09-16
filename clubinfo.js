import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs,getDoc, doc, updateDoc, deleteDoc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {updatePoints} from "./leaderboardScore.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged , signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";


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


export const showClubs = async function () {
  const databaseItems = await getDocs(collection(db, "clubs"));

  // Get separate containers for each level
  const L1Container = document.getElementById("clubsL1");
  const L2Container = document.getElementById("clubsL2");
  const L3Container = document.getElementById("clubsL3");

  // Clear existing entries
  L1Container.innerHTML = "";
  L2Container.innerHTML = "";
  L3Container.innerHTML = "";

  databaseItems.forEach((item) => {
    const clubData = item.data();
    const clubTile = document.createElement("button");
    clubTile.classList.add("clubButton");
    clubTile.innerHTML = `<span>${clubData.clubName}</span>`;

    clubTile.onclick = function () {
      location.replace("clubDash.html");
      sessionStorage.setItem("club", clubData.username);
    };

    // Append to the correct section based on type
    if (clubData.type === "L1") {
      L1Container.appendChild(clubTile);
    } else if (clubData.type === "L2") {
      L2Container.appendChild(clubTile);
    } else if (clubData.type === "L3") {
      L3Container.appendChild(clubTile);
    }
  });
};



export const displayClubInfo = async function () {
  console.log("displayClubInfo triggered");

  const parentName = sessionStorage.getItem("club");
  const parentDocRef = doc(db, "clubs", parentName);
  const clubDoc = await getDoc(parentDocRef);

  const clubName = document.getElementById("clubName");
  clubName.innerHTML = clubDoc.data().clubName;

  // Handle header background image (per-club override)
  const headerEl = document.getElementById("header");
  const headerImage = (clubDoc.data().headerImage || "").trim();
  if (headerImage) {
    // Override background image inline when a custom one exists
    headerEl.style.backgroundImage = `url("${headerImage}")`;
  }
  // Apply saved header font color if present
  const headerFontColor = (clubDoc.data().headerFontColor || "").trim();
  if (headerFontColor) {
    headerEl.style.color = headerFontColor;
  }

  const bio = document.getElementById("bio");
  const quickFacts = document.getElementById("quickFacts");

  // set headers
  bio.innerHTML = "<h2 class='underline'>About Us</h2>";
  quickFacts.innerHTML = "<h2 class='underline'>Club Information</h2>";

  const clubBio = document.createElement("h4");
  clubBio.textContent = clubDoc.data().bio;

  const dateFounded = document.createElement("h4");
  dateFounded.innerHTML = `<strong>Date founded:</strong> ${clubDoc.data().yearFounded}`;

  const meetingPlan = document.createElement("h4");
  meetingPlan.innerHTML = `<strong>Meeting frequency:</strong> ${clubDoc.data().meetingTime}`;

  const numMembers = document.createElement("h4");
  numMembers.innerHTML = `<strong>Number of members:</strong> ${clubDoc.data().memberCount}`;

  const leaderNames = document.createElement("h4");
  leaderNames.innerHTML = `<strong>Club Leaders:</strong> ${clubDoc.data().clubLeaders.join(", ")}`;

  // create drive and public link buttons wrapper
  const driveWrapper = document.createElement("div");
  driveWrapper.style.display = "flex";
  driveWrapper.style.justifyContent = "center";
  driveWrapper.style.gap = "15px"; // spacing between buttons
  driveWrapper.style.marginTop = "15px";
  driveWrapper.style.paddingTop = "10px";
  driveWrapper.style.borderTop = "1.5px solid #333";

  // Public link button: only show if a link exists
  const publicLinkValue = (clubDoc.data().publicLink || "").trim();
  const publicLabelValue = clubDoc.data().publicLinkLabel || "Related Resources";
  let publicButton;
  if (publicLinkValue) {
    publicButton = document.createElement("a");
    publicButton.innerHTML = publicLabelValue;
    publicButton.classList.add("clubButton");
    publicButton.href = publicLinkValue;
    publicButton.target = "_blank";
    publicButton.style.textDecoration = "none";
    driveWrapper.appendChild(publicButton);
  }

  let driveButton;
  if (sessionStorage.getItem("canEdit") === "true") {
    // Drive button only for editors
    driveButton = document.createElement("a");
    driveButton.innerHTML = "Club Drive";
    driveButton.classList.add("clubButton");
    driveButton.href = clubDoc.data().driveLink;
    driveButton.target = "_blank";
    driveButton.style.textDecoration = "none";
    if (publicButton) {
      driveWrapper.insertBefore(driveButton, publicButton); // Drive left of Public Link
    } else {
      driveWrapper.appendChild(driveButton);
    }

    // Edit buttons for bio
    const editBioBtn = document.createElement("button");
    const saveBioBtn = document.createElement("button");
    const cancelBioBtn = document.createElement("button");
    editBioBtn.textContent = "Edit";
    saveBioBtn.textContent = "Save";
    cancelBioBtn.textContent = "Cancel";
    editBioBtn.classList.add("meetingEdit");
    saveBioBtn.classList.add("meetingEdit");
    cancelBioBtn.classList.add("meetingEdit");
    saveBioBtn.style.display = "none";
    cancelBioBtn.style.display = "none";
    bio.querySelector("h2").appendChild(editBioBtn);
    bio.querySelector("h2").appendChild(saveBioBtn);
    bio.querySelector("h2").appendChild(cancelBioBtn);

    // Edit buttons for quick facts
    const editQuickBtn = document.createElement("button");
    const saveQuickBtn = document.createElement("button");
    const cancelQuickBtn = document.createElement("button");
    editQuickBtn.textContent = "Edit";
    saveQuickBtn.textContent = "Save";
    cancelQuickBtn.textContent = "Cancel";
    editQuickBtn.classList.add("meetingEdit");
    saveQuickBtn.classList.add("meetingEdit");
    cancelQuickBtn.classList.add("meetingEdit");
    saveQuickBtn.style.display = "none";
    cancelQuickBtn.style.display = "none";
    quickFacts.querySelector("h2").appendChild(editQuickBtn);
    quickFacts.querySelector("h2").appendChild(saveQuickBtn);
    quickFacts.querySelector("h2").appendChild(cancelQuickBtn);

    // Bio edit behavior
    editBioBtn.onclick = () => {
      const bioInput = document.createElement("textarea");
      bioInput.classList.add("recapEditBox");
      bioInput.value = clubBio.textContent;
      bioInput.id = "bioInput";
      bio.replaceChild(bioInput, clubBio);

      // Clear current buttons
      driveWrapper.innerHTML = "";

      // Drive input with label
      if (driveButton) {
        const driveLabel = document.createElement("label");
        driveLabel.textContent = "Drive Link:";
        driveLabel.htmlFor = "driveInput";
        const driveInput = document.createElement("input");
        driveInput.type = "url";
        driveInput.classList.add("bioEditBox");
        driveInput.value = driveButton.href;
        driveInput.id = "driveInput";
        driveInput.style.marginBottom = "5px";
        driveWrapper.appendChild(driveLabel);
        driveWrapper.appendChild(driveInput);
      }

      // Public link input with label
      const publicLabel = document.createElement("label");
      publicLabel.textContent = "Public Link:";
      publicLabel.htmlFor = "publicInput";
      const publicInput = document.createElement("input");
      publicInput.type = "url";
      publicInput.classList.add("bioEditBox");
      publicInput.value = (publicButton && publicButton.href) ? publicButton.href : (publicLinkValue || "");
      publicInput.id = "publicInput";
      publicInput.style.marginBottom = "5px";
      driveWrapper.appendChild(publicLabel);
      driveWrapper.appendChild(publicInput);

      // Public link label (button text) input with helper text
      const publicTextLabel = document.createElement("label");
      publicTextLabel.textContent = "Public Link Button Text:";
      publicTextLabel.htmlFor = "publicTextInput";
      const publicTextInput = document.createElement("input");
      publicTextInput.type = "text";
      publicTextInput.classList.add("bioEditBox");
      publicTextInput.placeholder = "link a website or google folder you would like others to see when visiting your club page";
      publicTextInput.value = publicLabelValue;
      publicTextInput.id = "publicTextInput";
      publicTextInput.style.marginBottom = "5px";
      driveWrapper.appendChild(publicTextLabel);
      driveWrapper.appendChild(publicTextInput);

      bio.appendChild(driveWrapper);

      editBioBtn.style.display = "none";
      saveBioBtn.style.display = "inline";
      cancelBioBtn.style.display = "inline";
    };

    cancelBioBtn.onclick = () => location.reload();

    saveBioBtn.onclick = async () => {
      const newBio = document.getElementById("bioInput").value.trim();
      const newDriveLink = driveButton ? document.getElementById("driveInput").value.trim() : null;
      const newPublicLink = document.getElementById("publicInput").value.trim();
      const newPublicLabel = document.getElementById("publicTextInput").value.trim() || "Related Resources";

      const updateData = { bio: newBio, publicLink: newPublicLink, publicLinkLabel: newPublicLabel };
      if (driveButton) updateData.driveLink = newDriveLink;

      await updateDoc(parentDocRef, updateData);
      location.reload();
    };

    // Quick facts edit behavior
    editQuickBtn.onclick = () => {
      const createEditable = (el, id) => {
        const input = document.createElement("input");
        input.classList.add("bioEditBox");
        input.value = el.textContent.split(":")[1]?.trim();
        input.id = id;
        return input;
      };
      quickFacts.replaceChild(createEditable(dateFounded, "yearInput"), dateFounded);
      quickFacts.replaceChild(createEditable(meetingPlan, "meetingInput"), meetingPlan);
      quickFacts.replaceChild(createEditable(numMembers, "memberInput"), numMembers);
      quickFacts.replaceChild(createEditable(leaderNames, "leaderInput"), leaderNames);

      editQuickBtn.style.display = "none";
      saveQuickBtn.style.display = "inline";
      cancelQuickBtn.style.display = "inline";
    };

    cancelQuickBtn.onclick = () => location.reload();

    saveQuickBtn.onclick = async () => {
      const newYear = document.getElementById("yearInput").value.trim();
      const newMeeting = document.getElementById("meetingInput").value.trim();
      const newMembers = parseInt(document.getElementById("memberInput").value.trim());
      const newLeaders = document.getElementById("leaderInput").value.trim().split(",").map(s => s.trim());

      if (!isNaN(newMembers) && newYear && newMeeting && newLeaders.length) {
        await updateDoc(parentDocRef, {
          yearFounded: newYear,
          meetingTime: newMeeting,
          memberCount: newMembers,
          clubLeaders: newLeaders
        });
        location.reload();
      } else {
        alert("Please provide valid inputs.");
      }
    };
  }

  // Append bio and quick facts content
  bio.appendChild(clubBio);
  bio.appendChild(driveWrapper);

  quickFacts.appendChild(leaderNames);
  quickFacts.appendChild(dateFounded);
  quickFacts.appendChild(meetingPlan);
  quickFacts.appendChild(numMembers);

  displayMeetingInfo(clubDoc.id);
};



async function displayMeetingInfo(id){
  console.log("sorting dates!");
  const pastMeetings = [];
  const futureMeetings = [];
  // Gets today's date to compare meetings.
  let today = new Date();
  // Reference to the club document using the passed id.
  const docRef = doc(db, "clubs", id);
  // Get a reference to the subcollection "all-meetings" within the club document.
  const meetingsCollectionRef = collection(docRef, "all-meetings");
  // Fetch all the meeting documents from the subcollection.
  const databaseItems = await getDocs(meetingsCollectionRef);

  // Loop through each meeting fetched from Firestore
  databaseItems.forEach((meeting) => {
    // Create a meeting object with necessary data.
    let meet = {
      date: meeting.data().date.toDate(),
      description: meeting.data().description,
      location: meeting.data().location,
      meetingID: meeting.id,
      attendance: meeting.data().attendance,
      isAnEvent: meeting.data().isAnEvent
    };

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
  var outlook = document.getElementById("outlook"); // Get reference to "outlook" section.
  var meetingListScrollable = document.getElementById("meetingListScrollable"); // Get reference to "meetingLog" section.
  

  // Loop through future meetings and create div elements for each.
  futureMeetings.forEach((meeting) => {
    var meetingDiv = document.createElement("div");
    var meetingInfo = document.createElement("div");
    var editMeetingDiv = document.createElement("div"); 
    // Create and style button for deleting the meeting
    var editbutton = document.createElement("button");
    editbutton.innerHTML = "Delete"; 
    // Adds appropriate classes for styling
    meetingInfo.classList.add('meetingBox');
    editMeetingDiv.classList.add('editMeetingDiv');
    meetingDiv.classList.add('meetingDiv');
    editbutton.classList.add('meetingEdit');

    // When clicked, it triggers the showDeleteModal with meetingID
    editbutton.onclick = function() {
      showDeleteModal(meeting.meetingID, id); 
    };

    // Append button and info to the meeting div
    if(sessionStorage.getItem("canEdit") == "true"){
      editMeetingDiv.appendChild(editbutton);
    }
    meetingDiv.appendChild(meetingInfo);
    meetingDiv.appendChild(editMeetingDiv);

  var meetingType = "Meeting";
    if (meeting.isAnEvent == true){
      meetingType = "Event";
    }


    // Populate meeting details
    meetingInfo.innerHTML = `
      <p>Date: ${meeting.date.toLocaleDateString()}</p>
      <p>Time: ${meeting.date.toLocaleTimeString()}</p>
      <p>Location: ${meeting.location}</p>
      <p>Type: ${meetingType}<p>
      <p>Meeting info: ${meeting.description}</p>
    `;

    // Append the meeting div to the "outlook" section
    outlook.appendChild(meetingDiv);
  });

  // Add button to register a new meeting
  var addEventDiv = document.createElement("div");
  var addButton = document.createElement("button");
  addEventDiv.classList.add('addEventDiv');
  addButton.classList.add('meetingEdit');
  addButton.classList.add('addButton');
  addButton.innerHTML = "register new meeting";
  
  // Append the "add new meeting" button
  if(sessionStorage.getItem("canEdit") == "true"){
    addEventDiv.appendChild(addButton);
  }
  outlook.appendChild(addEventDiv);

    addButton.onclick = function() {
    showEditModal(id); 
  };

  // Loop through past meetings and create div elements for each.
  pastMeetings.forEach((meeting) => {
    var meetingDiv = document.createElement("div");
    var meetingInfo = document.createElement("div");
    var editMeetingDiv = document.createElement("div");
    var editbutton = document.createElement("button");
    var saveButton = document.createElement("button");
    var cancelButton = document.createElement("button");
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";

    // Set buttons to be hidden by default.
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
    editbutton.innerHTML = "Edit";
    saveButton.innerHTML = "Save";
    cancelButton.innerHTML = "Cancel";

    // Add appropriate classes for styling
    meetingInfo.classList.add('meetingBox');
    editMeetingDiv.classList.add('editMeetingDiv');
    meetingDiv.classList.add('meetingDiv');
    editbutton.classList.add('meetingEdit');
    saveButton.classList.add('meetingEdit');
    deleteButton.classList.add('meetingEdit');
    cancelButton.classList.add('meetingEdit');
    saveButton.classList.add('meetingEditConf');
    cancelButton.classList.add('meetingEditConf');

    // Set unique ids for buttons using meetingID
    editbutton.id = `editButton-${meeting.meetingID}`;
    saveButton.id = `saveButton-${meeting.meetingID}`;
    cancelButton.id = `cancelButton-${meeting.meetingID}`;

    // Handle the "Edit" button click
    editbutton.onclick = function() {
      // Call the edit function with meetingID and club ID
      editMeetingInfo(meeting.meetingID, id); 
      editbutton.style.display = "none"; // Hide Edit button
      deleteButton.style.display = "none"
      saveButton.style.display = "flex"; // Show Save button
      cancelButton.style.display = "flex"; // Show Cancel button
    };

    // Handle the "Cancel" button click
    cancelButton.onclick = function() {
      location.reload(); // Reloads the page to revert changes.
    };

    deleteButton.onclick = function() {
      showDeleteModal(meeting.meetingID,id); 
    };

    // Append the buttons and meeting info div
    if(sessionStorage.getItem("canEdit") == "true"){
      editMeetingDiv.appendChild(editbutton);
      editMeetingDiv.appendChild(deleteButton);
      editMeetingDiv.appendChild(saveButton);
      editMeetingDiv.appendChild(cancelButton);  
    }

    
    meetingDiv.appendChild(meetingInfo);
    if(sessionStorage.getItem("canEdit") == "true"){
      meetingDiv.appendChild(editMeetingDiv);
    }

        var meetingType = "Meeting";
    if (meeting.isAnEvent == true){
      meetingType = "Event";
    }


    // Populate meeting details for past meetings
    meetingInfo.innerHTML = `
      <p>Date: ${meeting.date.toLocaleDateString()}</p>
      <p>Time: ${meeting.date.toLocaleTimeString()}</p>

      <div class="infoContainer">
        <span>Location:</span>
        <span id="location-${meeting.meetingID}">${meeting.location}</span>
      </div>

      <div class="infoContainer">
        <span>Attendance:</span>
        <span id="attendance-${meeting.meetingID}">${meeting.attendance}</span>
      </div>

      <div class="infoContainer">
        <span>Type:</span>
        <span id="type-${meeting.meetingID}">${meetingType}</span>
      </div>
      
      <div class="infoContainer">
        <span>Meeting recap:</span>
        <span id="recap-${meeting.meetingID}">${meeting.description}</span>
      </div>
    `;

    // Append the meeting div to the "meetingListScrollable" section
    meetingListScrollable.appendChild(meetingDiv);
  });
}

// simple helperfuntion to compare dates durring sorting
// (I had to look into this, but it should be correct)
function compareDates(meetingA, meetingB) {
  return new Date(meetingA.date) - new Date(meetingB.date);
}
function compareReverseDates(meetingA, meetingB) {
  return new Date(meetingB.date) - new Date(meetingA.date);
}

async function showEditModal(id){
  console.log('meeting create modal Opened')
  // clubID should be the name of the club
  const clubID = sessionStorage.getItem("club"); 
  console.log(clubID);
  // Show the delete confirmation modal
  const modal = document.getElementById("createMeetModal");
  modal.style.display = "flex";

  const createButton = document.getElementById("createMeetButton");
  createButton.onclick = function (){
    console.log("function create called")
    createMeeting(id);
  }
}

async function createMeeting(id) {
  console.log("Create meeting called!");
  // Get input values
  const meetingDate = document.getElementById("meeting-date").value;
  const meetingTime = document.getElementById("meeting-time").value;
  const meetingDesc = document.getElementById("meeting-desc").value;
  const meetingLocation = document.getElementById("meeting-location").value;
  const isAnEvent = document.querySelector('input[name="event"]:checked')?.value === "yes";
  //Checks if the date exists (should allways, but better safe than sorry + added meeting description)
  if (!meetingDate || !meetingTime || !meetingDesc || !meetingLocation) {
    alert("Please fill in all fields!");
    return;
  }
  // Convert date and time input to a Firestore timestamp
  const [year, month, day] = meetingDate.split("-").map(Number);
  const [hours, minutes] = meetingTime.split(":").map(Number);
  const fullDate = new Date(year, month - 1, day, hours, minutes);
  console.log(fullDate);
  const meetingTimestamp = Timestamp.fromDate(fullDate);

    // Get a reference to the "all-meetings" subcollection
    const docRef = doc(db, "clubs", id);
    const meetingsCollectionRef = collection(docRef, "all-meetings");
    // Create a new meeting document
    const newMeetingRef = doc(meetingsCollectionRef); // Auto-generate ID
    await setDoc(newMeetingRef, {
        attendance: 0,
        description: meetingDesc,
        location: meetingLocation,
        date: meetingTimestamp,
        isAnEvent: isAnEvent
    });

    console.log("Meeting saved successfully!");
    location.reload();
}

async function showDeleteModal(meetingID, id) {
  // I want to add sone of the meeting info club, date, time
  // so that the user can see what meeting they are deleteing before they delete it!

  console.log('meeting delete double check!')
  // clubID should be the name of the club
  const clubID = sessionStorage.getItem("club"); 
  console.log(clubID);
  console.log(meetingID);
  // Show the delete confirmation modal
  const modal = document.getElementById("deleteConfModal");
  modal.style.display = "flex";
  document.getElementById('confDelete').onclick = function (){
    deleteMeeting(meetingID, id);
  }
}

async function deleteMeeting(meetingID, id) {
  console.log('meeting delete function activated...');
  const docRef = doc(db, "clubs", id);
    // Get a reference to the subcollection "all-meetings"
    const meetingsCollectionRef = collection(docRef, "all-meetings");
    const databaseItem = doc(meetingsCollectionRef, meetingID);
    await deleteDoc(databaseItem);
    console.log("deleted!");
    location.reload();
}

async function editMeetingInfo(meetingID, id) {
  console.log('meeting edit function activated!');

  // Gets the actual DOM elements for attendance and recap using dynamic IDs
  const attendanceElement = document.getElementById(`attendance-${meetingID}`);
  const recapElement = document.getElementById(`recap-${meetingID}`);
  const locationElement = document.getElementById(`location-${meetingID}`);
  //const isEventElement = document.getElementById(`type-${meetingID}`);

  // Get the text content of these elements
  const attendanceCount = attendanceElement.textContent.replace('Attendance : ', ''); // Removing the part after? "Attendance : " part
  const meetingRecap = recapElement.textContent.replace('Meeting recap: ', ''); // Removing "Meeting recap: " part
  //const isEvent = isEventElement.textContent.replace('Meeting type: ', '');// Removing "Meeting recap: " part
  const meetingSpot = locationElement.textContent.replace('Location: ', ''); // Removing "Meeting recap: " part

  // Create text input and textarea elements
  const attendanceInput = document.createElement('input');
  const recapInput = document.createElement('textarea');
  const locationInput = document.createElement('input');
  //const isEventInput = document.createElement('input');
  attendanceInput.classList.add("attendance");
  recapInput.classList.add("recapEditBox");
  locationInput.classList.add("locationEditBox");
  recapInput.id = 'recapInput';
  locationInput.id = 'locationInput'

  // Set the value of the input to the current text of the paragraph
  attendanceInput.value = attendanceCount; // Assigning the text value to the input
  recapInput.value = meetingRecap; // Assigning the text value to the textarea
  locationInput.value = meetingSpot;

  // Replace the paragraph elements with the input boxes
  attendanceElement.parentNode.replaceChild(attendanceInput, attendanceElement);
  recapElement.parentNode.replaceChild(recapInput, recapElement);
  locationElement.parentNode.replaceChild(locationInput, locationElement);

  // saving info:
  const saveButtonElement = document.getElementById(`saveButton-${meetingID}`);

// Add a click event listener for the save button
  saveButtonElement.onclick = async function() {
    console.log("Save button clicked!");
    const docRef = doc(db, "clubs", id);
    // Get a reference to the subcollection "all-meetings"
    const clubDocSnapshot = await getDoc(docRef);
    const meetingDate = clubDocSnapshot.data().lastMeeting;
    const date = meetingDate.toDate();
    console.log(date);
    const meetingsCollectionRef = collection(docRef, "all-meetings");
    const databaseItem = doc(meetingsCollectionRef, meetingID);
    const databaseItemSnapshot = await getDoc(databaseItem);
    const oldAttendance = databaseItemSnapshot.data().attendance;
    console.log(oldAttendance);
    const wasEvent = databaseItemSnapshot.data().isAnEvent;
    console.log(wasEvent);
    // Get the new values from input fields and removes white space
    const newAttendanceString = attendanceInput.value.trim();
    // Convert the string to an integer
    const newAttendance = parseInt(newAttendanceString, 10); // base 10/normal
    const newRecap = recapInput.value;
    //checks to see if the new attendance value works (not zero)
    if (!isNaN(newAttendance) && newRecap){
      await updateDoc(databaseItem,{
        attendance: newAttendance,
        description: newRecap,
      });

      const MD = databaseItemSnapshot.data().date;
      const D = MD.toDate();
      console.log(D);

      if(D > date){
        await updateDoc(docRef, {
          lastMeeting: D
        });
        console.log("LAST MEETING DATE UPDATED")
      }


      console.log("LAST MEETING UPDATED COMP")

      // Log success
      await updatePoints(id, oldAttendance, newAttendance, wasEvent, wasEvent);
      console.log('Document successfully updated!');
    }
    else{
      console.log('failure to update');
      alert("failure to update");
    };
    console.log("end");
    location.reload();
  };
}

// LOTS OF ACOUNT EDITING/ RULES FUNCTIONS

export async function cLogin() {
  const clubId = sessionStorage.getItem("club");
  const enteredPassword = sessionStorage.getItem("password");

  const docRef = doc(db, "clubs", clubId);
  const docSnap = await getDoc(docRef);

  sessionStorage.setItem("canEdit", "false");

  if (docSnap.exists()) {
    const clubData = docSnap.data();
    if (enteredPassword === clubData.password) {
      console.log("club login working");
      sessionStorage.setItem("clubAuth", "true"); // set before redirect
      location.replace("clubDash.html");
    } else {
      console.log("wrong username/password");
      sessionStorage.setItem("clubAuth", "false");
      alert("Wrong Username or Password");
    }
  } else {
    console.log("Club not found");
    alert("Club not found");
    sessionStorage.setItem("clubAuth", "false");
  }
}


export async function editVerification() {
  // get the club info from the database
  var docRef = doc(db, "clubs", sessionStorage.getItem("club"));
  var docSnap = await getDoc(docRef);

  // just checking if you're logged in
  console.log("checking that you're logged in");

  // start by saying they can't edit just in case
  sessionStorage.setItem("canEdit", "false");

  // grab info from sessionStorage
  const clubAuth = sessionStorage.getItem("clubAuth");
  const club = sessionStorage.getItem("club");
  const password = sessionStorage.getItem("password");
  const isGod = sessionStorage.getItem("isGod");

  // check if it's a club account and credentials match
  if (clubAuth === "true") {
    if (club === docSnap.data().username && password === docSnap.data().password) {
      sessionStorage.setItem("canEdit", "true");
      console.log("you can edit this page!!!");
    } else {
      console.log("you CANT edit this page - wrong club username or password");
    }
  } 
  // if it's an admin account
  else if (isGod === "true") {
    sessionStorage.setItem("canEdit", "true");
    console.log("you can edit this page cause you're an admin!!!");
  } 
  // not logged in at all
  else {
    console.log("you CANT edit this page - you're not logged in");
  }

  //make buttons show/hide depending on who you are

  const loginBtn = document.getElementById("login");
  const logoutBtn = document.getElementById("logout");
  const adminBtn = document.getElementById("adminPageBtn");

  // figure out if you're logged in as either club or admin
  const loggedIn = clubAuth === "true" || isGod === "true";

  if (loggedIn) {
    // hide login button
    if (loginBtn){ loginBtn.style.display = "none";}

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = function () {
        // Only clear login/auth session keys
        sessionStorage.removeItem("clubAuth");
        sessionStorage.removeItem("isGod");
        sessionStorage.removeItem("canEdit");
        sessionStorage.removeItem("password");

        //reload the page to update UI
        location.reload();
      };
    }

    if (isGod === "true" && adminBtn){ adminBtn.style.display = "inline-block";}

    // Add header image edit controls for editors/admins
    try {
      const canEdit = sessionStorage.getItem("canEdit") === "true";
      if (canEdit) {
        const headerEl = document.getElementById("header");
        if (headerEl && !document.getElementById("editHeaderControls")) {
          // wrapper to position over header
          const controls = document.createElement("div");
          controls.id = "editHeaderControls";
          controls.style.position = "absolute";
          controls.style.top = "10px";
          controls.style.right = "10px";
          controls.style.display = "flex";
          controls.style.gap = "8px";
          controls.style.zIndex = "2";

          // Ensure header can be a positioning context
          const prevPos = getComputedStyle(headerEl).position;
          if (prevPos === "static" || !prevPos) headerEl.style.position = "relative";

          // Create buttons
          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit Header";
          editBtn.classList.add("meetingEdit");

          const removeBtn = document.createElement("button");
          removeBtn.textContent = "Remove Image";
          removeBtn.classList.add("meetingEdit");

          // Inline panel: URL field + font color + confirm
          const panel = document.createElement("div");
          panel.style.display = "none";
          panel.style.background = "rgba(0,0,0,0.65)";
          panel.style.padding = "8px";
          panel.style.borderRadius = "6px";
          panel.style.backdropFilter = "blur(2px)";
          panel.style.alignItems = "center";
          panel.style.gap = "6px";
          panel.style.color = "#fff";

          const urlInput = document.createElement("input");
          urlInput.type = "url";
          urlInput.placeholder = "https://example.com/header.jpg";
          urlInput.classList.add("bioEditBox");
          urlInput.style.minWidth = "260px";

          const colorLabel = document.createElement("span");
          colorLabel.textContent = "Font:";
          colorLabel.style.marginLeft = "8px";

          const colorSelect = document.createElement("select");
          colorSelect.classList.add("meetingEdit");
          const optionMaroon = document.createElement("option");
          optionMaroon.value = "#7A0019"; // Minnesota maroon
          optionMaroon.textContent = "Maroon";
          const optionWhite = document.createElement("option");
          optionWhite.value = "#FFFFFF";
          optionWhite.textContent = "White";
          colorSelect.appendChild(optionMaroon);
          colorSelect.appendChild(optionWhite);

          // Initialize font selection based on current style
          try {
            const currentColor = getComputedStyle(headerEl).color;
            const approxWhite = /rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i.test(currentColor);
            colorSelect.value = approxWhite ? "#FFFFFF" : "#7A0019";
          } catch {}

          // Toggle panel
          editBtn.onclick = () => {
            panel.style.display = panel.style.display === "none" ? "flex" : "none";
          };

          // Confirm button to save URL and color
          const confirmBtn = document.createElement("button");
          confirmBtn.textContent = "Confirm";
          confirmBtn.classList.add("meetingEdit");
          confirmBtn.onclick = async () => {
            const url = (urlInput.value || "").trim();
            const chosen = colorSelect.value;
            try {
              await updateDoc(
                doc(db, "clubs", sessionStorage.getItem("club")),
                { headerImage: url, headerFontColor: chosen }
              );
              // Apply immediately and collapse
              headerEl.style.backgroundImage = url ? `url("${url}")` : "";
              headerEl.style.color = chosen;
              panel.style.display = "none";
            } catch (err) {
              console.error(err);
              alert("Failed to save header settings.");
            }
          };

          // Remove image behavior
          removeBtn.onclick = async () => {
            try {
              await updateDoc(doc(db, "clubs", sessionStorage.getItem("club")), { headerImage: "" });
              // Revert to default (CSS background)
              headerEl.style.backgroundImage = "";
              panel.style.display = "none";
            } catch (err) {
              console.error(err);
              alert("Failed to remove image.");
            }
          };

          // Assemble controls
          panel.appendChild(urlInput);
          panel.appendChild(colorLabel);
          panel.appendChild(colorSelect);
          panel.appendChild(confirmBtn);

          controls.appendChild(editBtn);
          controls.appendChild(removeBtn);
          controls.appendChild(panel);
          headerEl.appendChild(controls);
        }
      }
    } catch (e) {
      console.warn("Could not set up header image edit controls", e);
    }
  }
  
  else {
    // not logged in, show login and hide everything else
    if (loginBtn) {loginBtn.style.display = "inline-block";}
    if (logoutBtn) {logoutBtn.style.display = "none";}
    if (adminBtn) {adminBtn.style.display = "none";}
  }
}

export function correctNavDisplayCD() {
  const loginBtn = document.getElementById("login");
  const logoutBtn = document.getElementById("logout");
  const adminBtn = document.getElementById("adminPageBtn");

  const clubAuth = sessionStorage.getItem("clubAuth");
  const isGod = sessionStorage.getItem("isGod");

  // User is logged in if clubAuth or isGod is true
  const loggedIn = clubAuth === "true" || isGod === "true";

  if (loggedIn) {
    if (loginBtn) loginBtn.style.display = "none";

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = function () {
        // If admin, sign out of Firebase too
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

    // Only show admin button if user is an admin
    if (isGod === "true" && adminBtn) {
      adminBtn.style.display = "inline-block";
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (adminBtn) adminBtn.style.display = "none";
  }
}
