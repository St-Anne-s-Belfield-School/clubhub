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
  sessionStorage.setItem("username", user);
  sessionStorage.setItem("password", pass)
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

//onclick function
export const moreInfo = async function(){

  // if made it this far, then username does not exist, so sign up proceeds and creates new document named username wtih two fields, for username and password
  await setDoc(doc(db, "clubs", sessionStorage.getItem("username")), {
          username: sessionStorage.getItem("username"),
          password: sessionStorage.getItem("password")
        });
  // getDoc(docRef)
  // .then((docSnapshot) => {
  //   if (docSnapshot.exists()) {
  //     // Document exists
  //     console.log("username exists");
  //     alert("Username already exists. Choose new username.");
  //     return;
  //   } 
  //     // Document does not exist
  //     console.log("username is available");
  //     

  // adds leaders to "leaderList" depending on which dropdown chosen/generated
  var leaderList = [];
  if (document.getElementById("number").value == "one"){
    leaderList.push(document.getElementById("leader1").value)
  }
  else if (document.getElementById("number").value == "two"){
    leaderList.push(document.getElementById("leader1").value);
    leaderList.push(document.getElementById("leader2").value);
  }
  else if (document.getElementById("number").value == "three"){
    leaderList.push(document.getElementById("leader1").value);
    leaderList.push(document.getElementById("leader2").value);
    leaderList.push(document.getElementById("leader3").value);
  }

  // adds meetingTime to meetingTime depending on whether dropdown selection or "other" selectiojn
  var meetingTime  = "";
  if (document.getElementById("meeting").value == "other"){
    meetingTime = document.getElementById("inpM").value;
  }
  else{
    meetingTime = document.getElementById("meeting").value;
  }

//  recieving the username (saved with sessionStorage in register function)
  await updateDoc(doc(db, "clubs", sessionStorage.getItem("username")), {
    // adding fields:
    clubName: document.getElementById("clubName").value,
    clubLeaders: leaderList,
    meetingTime: meetingTime,
    type: document.getElementById("typeSelection").value,
    // parses it into list instead of string; from sessionStorage from MultiSelect.js page
    tags: JSON.parse(sessionStorage.getItem("tags")),
    memberCount: document.getElementById("memberCount").value,
    yearFounded: document.getElementById("yearFounded").value,
    bio: document.getElementById("bio").value,
    points: 0,
    lastMeeting: new Date() //KATE ADDED THIS FOR CALCULATING CLUBS IN DANGER!!!
  }
);
// each section of this prints correctly into console. selected tags show up as list that updates as new tags added
// however, only issue is that the clusb thesmelves are not showing up in firebase --> truing to problem solve this next

//changes URL
  sessionStorage.setItem("club", document.getElementById("clubName").value);
  window.location.href = "clubDash.html";
}

//collection --> clubs
//document
//fields bio, name, password, username

// initialize Firebase