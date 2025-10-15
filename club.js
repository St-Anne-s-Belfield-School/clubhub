import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, query, getCountFromServer, where, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
// const auth = getAuth(app);

export const login2 = async function(){
  console.log("TEST")
}

// export const nameNewUser = async function(user, pass){
//   await setDoc(doc(db, "clubs", user), {
//     username: user,
//     password: pass
//   });
// }
// creates new document in firebase per club; name of document is the username(which users should set as their club's name)
export const register = async function(user, pass){
//added feature so that does not create new club in firebase until after more information page, in case someone goes to register page instead of login. Also fixed alert for if username already exits; wasnot showing up and was allowithrough to more info page
  // var username = document.getElementById('username').value;
  // var password = document.getElementById('password').value;
  // const docRef = doc(db, "clubs", user);
  const q = query(collection(db, "clubs"), where("username", "==", user));
  // const querySnapshot = await getDocs(q);
  // creates immediate snapshot document of data currently
  const snapshot = await getCountFromServer(q);
  console.log(snapshot.data().count);
  console.log("hello");
  // testing if username exists
  if(snapshot.data().count != 0){
    console.log("hiiii");
    console.log("username exists");
    // alert!!
      alert("Username already exists. Choose new username.");
      // stops function so that club cannot create an account with an already-in-use username
      return;
  }

      console.log(user);
  // saving username across pages
  localStorage.setItem("username", user);
  localStorage.setItem("password", pass)
  // switches page to more information page beyond registration page
  window.location.href="moreInfo.html";
    
  // })
  // .catch((error) => {
  //   console.error("Error checking document:", error);
  // });
// Add a new document in collection "clubs"

  // await addDoc(collection(db, "clubs", user), {
    
  // });
  
}

export const deleteIncompleteClub = async function () {
  const username = localStorage.getItem("username");

  if (!username) {
    return;
  }

  try {
    await deleteDoc(doc(db, "clubs", username));
    console.warn(`Deleted incomplete club submission for ${username}.`);
  } catch (error) {
    console.error("Failed to delete incomplete club submission:", error);
  }
};

//onclick function
export const moreInfo = async function(){
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  if (!username || !password) {
    alert("Your session has expired. Please register again.");
    await deleteIncompleteClub();
    return;
  }

  const clubNameInput = document.getElementById("clubName")?.value.trim();
  const leaderSelection = document.getElementById("number")?.value;
  const meetingSelection = document.getElementById("meeting")?.value;
  const meetingOtherInput = document.getElementById("inpM")?.value.trim();
  const typeSelection = document.getElementById("typeSelection")?.value;
  const memberCountInput = document.getElementById("memberCount")?.value.trim();
  const facultyAdvisorInput = document.getElementById("facultyAdvisor")?.value.trim() || "";
  const bioInput = document.getElementById("bio")?.value.trim();
  const driveShareLinkInput = document.getElementById("driveShareLink")?.value.trim();
  const storedTags = sessionStorage.getItem("tags");
  const tags = storedTags ? JSON.parse(storedTags) : [];

  const leaderList = [];
  const contactList = [];

  if (leaderSelection === "one") {
    leaderList.push(document.getElementById("leader1")?.value.trim() || "");
    contactList.push(document.getElementById("email1")?.value.trim() || "");
  } else if (leaderSelection === "two") {
    leaderList.push(document.getElementById("leader1")?.value.trim() || "");
    contactList.push(document.getElementById("email1")?.value.trim() || "");
    leaderList.push(document.getElementById("leader2")?.value.trim() || "");
    contactList.push(document.getElementById("email2")?.value.trim() || "");
  } else if (leaderSelection === "three") {
    leaderList.push(document.getElementById("leader1")?.value.trim() || "");
    contactList.push(document.getElementById("email1")?.value.trim() || "");
    leaderList.push(document.getElementById("leader2")?.value.trim() || "");
    contactList.push(document.getElementById("email2")?.value.trim() || "");
    leaderList.push(document.getElementById("leader3")?.value.trim() || "");
    contactList.push(document.getElementById("email3")?.value.trim() || "");
  }

  let meetingTime = "";

  if (meetingSelection === "other") {
    meetingTime = meetingOtherInput || "";
  } else {
    meetingTime = meetingSelection || "";
  }

  const errors = [];

  if (!clubNameInput) {
    errors.push("Club name is required.");
  }

  if (!leaderSelection || leaderSelection === "choose") {
    errors.push("Please select the number of club leaders.");
  }

  const missingLeaderNames = leaderList.some((name) => !name);

  if (leaderList.length === 0 || missingLeaderNames) {
    errors.push("Please provide a name for each club leader.");
  }

  if (!meetingTime || meetingTime === "choose") {
    errors.push("Please specify the meeting frequency.");
  }

  if (meetingSelection === "other" && !meetingOtherInput) {
    errors.push("Please provide a meeting time when selecting 'other'.");
  }

  if (!typeSelection || typeSelection === "choose") {
    errors.push("Please select the club type.");
  }

  if (!memberCountInput) {
    errors.push("Please provide the number of members.");
  }

  if (!bioInput) {
    errors.push("Please provide a club bio.");
  }

  if (!driveShareLinkInput) {
    errors.push("Please provide the club Google Drive link.");
  }

  if (errors.length > 0) {
    alert(`We couldn't create your club because of the following issues:\n- ${errors.join("\n- ")}`);
    await deleteIncompleteClub();
    return;
  }

//receiving the username (saved with localStorage in register function)
  await setDoc(doc(db, "clubs", username), {
    username,
    password,
    clubName: clubNameInput,
    clubLeaders: leaderList,
    meetingTime,
    driveLink: driveShareLinkInput,
    type: typeSelection,
    tags,
    memberCount: memberCountInput,
    facultyAdvisor: facultyAdvisorInput,
    contactEmails: contactList,
    bio: bioInput,
    points: 0,
    lastMeeting: new Date()
  });

// each section of this prints correctly into console. selected tags show up as list that updates as new tags added
// however, only issue is that the clusb thesmelves are not showing up in firebase --> truing to problem solve this next

//changes URL
  sessionStorage.setItem("club", username);
  window.location.href = "clubDash.html";
}
//collection --> clubs
//document
//fields bio, name, password, username

// initialize Firebase
