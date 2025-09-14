import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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


//The function
export const updatePoints = async function(clubUsername, oAttendance, nAttendance, oldEventBoolean, eventBoolean){
   //in Kate's code

  console.log(clubUsername);
  console.log(oAttendance);
  console.log(nAttendance);
  console.log(oldEventBoolean);
  console.log(eventBoolean);

  var username = clubUsername;
  //attendance from previous edit of meeting
  var oldAttendance = oAttendance;
  //attendance changed to now
  var newAttendance = nAttendance;
  //whether or not meeting was previously an event
  var oldEvent = oldEventBoolean;
  //previous points dedicated to whether meeting was an event or not
  var oldEventPoint = 0;
  //whether or not meeting is now an event
  var newEvent = eventBoolean;
  //ppints for event or not
  var newMeetingPoints = 0;
  //point total which is local until it updates in firebase at the very end One time.
  var localPointTotal = 0;

  const docRef = doc(db, "clubs", username);

  const docSnap = await getDoc(docRef);
  console.log("help");
  //getting pointTotal for club from firebase
  const pointTotal = docSnap.data().points;
  console.log("old total" + pointTotal);
  // const meetingsCollectionRef = collection(docRef, "all-meetings");
  // const databaseItem = doc(meetingsCollectionRef, meetingId);
  // const attendance = doc(databaseItem, "attendance");
  
  //number of members in club
  const memberCount = docSnap.data().memberCount;

  //calculating point for attendances
  var oldAttendancePoint = oldAttendance/memberCount;
  var newAttendancePoint = newAttendance/memberCount;
  console.log("oldattendance: " + oldAttendance);
  console.log("newattendance: " + newAttendance);
  console.log("oldattendancept: " + oldAttendancePoint);
  console.log("newattendancept: " + newAttendancePoint);

  //calculating previous points designated to meeting vs event
  if (oldEvent == true){
    oldEventPoint = 3;
  }
  else{
    oldEventPoint = 2;
  }

  console.log("og point total = " + pointTotal);

  //setting local point total to point total without any points related to this meeting. No duplicate points for one meeting.
  localPointTotal = pointTotal - oldAttendancePoint - oldEventPoint;

  console.log("reset point total = " + localPointTotal);


  // await updateDoc(doc(db, "clubs", username), {
  //     //resetting points to before prior edit:
  //     points: pointTotal - (oldAttendancePoint + oldEventPoint),
  //   }
  // );
  // // var refreshedPoints = pointTotal - (oldAttendancePoint + oldEventPoint);
  // console.log("is this what we want" + (pointTotal - oldAttendancePoint - oldEventPoint));

  //resetting point total:
  // const resetPointTotal = docSnap.data().points;
  // console.log("refreshed pt total, not inclduing thsi event: " + resetPointTotal);
  
  // calculate new points to add:
  //points for event vs. meeting
  console.log("before calc" + newEvent);
  if (newEvent == true){
    newMeetingPoints = newMeetingPoints + 3;
    console.log("is event")
  }
  else{
    newMeetingPoints = newMeetingPoints + 2;
  }

  console.log(newMeetingPoints);
  //adding new, updated points for meeting to meeting total
  localPointTotal = localPointTotal + newMeetingPoints + newAttendancePoint;

  console.log("end newTotal = " + localPointTotal);

  updateDoc(doc(db, "clubs", username), {
    //adding newly calculated pt total additions from this meeting
      points: localPointTotal,
  });

  console.log("did you make it?");

  ////comparing with leaderboards:::
  //getting leaderboard point totals (1st-3rd places for L1, L2 and L3 clubs)
  const docRefOneFirst = doc(db, "metadata", "L1first");
  const docSnapOneFirst = await getDoc(docRefOneFirst);
  const pointL1First = docSnapOneFirst.data().points;
  const nameL1First = docSnapOneFirst.data().clubName;

  const docRefOneSecond = doc(db, "metadata", "L1second");
  const docSnapOneSecond = await getDoc(docRefOneSecond);
  const pointL1Second = docSnapOneSecond.data().points;
  const nameL1second = docSnapOneSecond.data().clubName;

  const docRefOneThird = doc(db, "metadata", "L1third");
  const docSnapOneThird = await getDoc(docRefOneThird);
  const pointL1Third = docSnapOneThird.data().points;
  const nameL1third = docSnapOneThird.data().clubName;

  const docRefTwoFirst = doc(db, "metadata", "L2first");
  const docSnapTwoFirst = await getDoc(docRefTwoFirst);
  const pointL2First = docSnapTwoFirst.data().points;
  const nameL2First = docSnapTwoFirst.data().clubName;
      console.log(nameL2First);
  
  const docRefTwoSecond = doc(db, "metadata", "L2second");
  const docSnapTwoSecond = await getDoc(docRefTwoSecond);
  const pointL2Second = docSnapTwoSecond.data().points;
  const nameL2second = docSnapTwoSecond.data().clubName;
  
  const docRefTwoThree = doc(db, "metadata", "L2third");
  const docSnapTwoThird = await getDoc(docRefTwoThree);
  const pointL2Third = docSnapTwoThird.data().points;
  const nameL2third = docSnapTwoThird.data().clubName;

  const docRefThreeFirst = doc(db, "metadata", "L3first");
  const docSnapThreeFirst = await getDoc(docRefThreeFirst);
  const pointL3First = docSnapThreeFirst.data().points;
  const nameL3first = docSnapThreeFirst.data().clubName;

  const docRefThreeSecond = doc(db, "metadata", "L3second");
  const docSnapThreeSecond = await getDoc(docRefThreeSecond);
  const pointL3Second = docSnapThreeSecond.data().points;
  const nameL3Second = docSnapThreeSecond.data().clubName;
  
  const docRefThreeThird = doc(db, "metadata", "L3third");
  const docSnapThreeThird = await getDoc(docRefThreeThird);
  const pointL3Third = docSnapThreeThird.data().points;
  const nameL3Third = docSnapThreeThird.data().clubName;

  const type = docSnap.data().type;
  console.log(type);
  console.log(username);
  console.log(localPointTotal);

  if (type === "L1") {
    console.log("running L1");
    let LOneArray = [
      { club: nameL1First, points: pointL1First },
      { club: nameL1second, points: pointL1Second },
      { club: nameL1third, points: pointL1Third }
    ];
    // Remove any existing entry with the same club name
    const index1 = LOneArray.findIndex(entry => entry.club === docSnap.data().clubName);
    if (index1 !== -1) {
      LOneArray.splice(index1, 1);
    }
    // Add the new/updated score and sort
    LOneArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    LOneArray.sort((a, b) => b.points - a.points);

    await updateDoc(doc(db, "metadata", "L1first"), {
      clubName: LOneArray[0].club,
      points: LOneArray[0].points,
    });
    await updateDoc(doc(db, "metadata", "L1second"), {
      clubName: LOneArray[1].club,
      points: LOneArray[1].points,
    });
    await updateDoc(doc(db, "metadata", "L1third"), {
      clubName: LOneArray[2].club,
      points: LOneArray[2].points,
    });
    console.log("DONE L1");
  }

  if (type === "L2") {
    console.log("running L2");
    let LTwoArray = [
      { club: nameL2First, points: pointL2First },
      { club: nameL2second, points: pointL2Second },
      { club: nameL2third, points: pointL2Third }
    ];
    console.log(LTwoArray + "before editing");

    // Remove any existing entry with the same club name
    const index = LTwoArray.findIndex(entry => entry.club === docSnap.data().clubName);
    
    if (index !== -1) {
      LTwoArray.splice(index, 1);
    }
    console.log(LTwoArray + "after filter");
    // Add the new/updated score
    LTwoArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    console.log(LTwoArray + "after push");
    // Sort by points in descending order
    LTwoArray.sort((a, b) => b.points - a.points);
    console.log(LTwoArray + "after sort");

    await updateDoc(doc(db, "metadata", "L2first"), {
      clubName: LTwoArray[0].club,
      points: LTwoArray[0].points,
    });
    await updateDoc(doc(db, "metadata", "L2second"), {
      clubName: LTwoArray[1].club,
      points: LTwoArray[1].points,
    });
    await updateDoc(doc(db, "metadata", "L2third"), {
      clubName: LTwoArray[2].club,
      points: LTwoArray[2].points,
    });
    console.log("DONE")
  }

  if (type == "L3"){
    console.log("running L3");
    const LThreeArray = [
      { club: nameL3first, points: pointL3First },
      { club: nameL3Second, points: pointL3Second },
      { club: nameL3Third, points: pointL3Third }
    ];
    console.log(LThreeArray + "before editing");
    // Remove any existing entry with the same club name
    const index = LThreeArray.findIndex(entry => entry.club  === docSnap.data().clubName);

    if (index !== -1) {
      LThreeArray.splice(index, 1);
    }
    console.log(LThreeArray + "after splice");
    // Add the new/updated score
    LThreeArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    console.log(LThreeArray + "after push");
    // Sort by points in descending order
    LThreeArray.sort((a, b) => b.points - a.points);
    console.log(LThreeArray + "after sort");


    await updateDoc(doc(db, "metadata", "L3first"), {
      clubName: LThreeArray[0].club,
      points: LThreeArray[0].points,
    });
    await updateDoc(doc(db, "metadata", "L3second"), {
      clubName: LThreeArray[1].club,
      points: LThreeArray[1].points,
    });
    await updateDoc(doc(db, "metadata", "L3third"), {
      clubName: LThreeArray[2].club,
      points: LThreeArray[2].points,
    });
    console.log("------DONE-----");
  }
}

// ensure L1 leaderboard docs exist
async function ensureL1LeaderboardDocs() {
  const l1firstRef = doc(db, "metadata", "L1first");
  const l1secondRef = doc(db, "metadata", "L1second");
  const l1thirdRef = doc(db, "metadata", "L1third");

  const [firstSnap, secondSnap, thirdSnap] = await Promise.all([
    getDoc(l1firstRef),
    getDoc(l1secondRef),
    getDoc(l1thirdRef)
  ]);

  const ops = [];
  if (!firstSnap.exists()) ops.push(setDoc(l1firstRef, { clubName: "", points: 0 }));
  if (!secondSnap.exists()) ops.push(setDoc(l1secondRef, { clubName: "", points: 0 }));
  if (!thirdSnap.exists()) ops.push(setDoc(l1thirdRef, { clubName: "", points: 0 }));
  if (ops.length) await Promise.all(ops);
}

//fucntion to add leaderboard to home page
export const loadLeaderboard = async function(){
  // make sure L1 docs exist
  await ensureL1LeaderboardDocs();
  
  //gets data
  const docRefOneFirst = doc(db, "metadata", "L1first");
  const docSnapOneFirst = await getDoc(docRefOneFirst);

  const docRefOneSecond = doc(db, "metadata", "L1second");
  const docSnapOneSecond = await getDoc(docRefOneSecond);

  const docRefOneThird = doc(db, "metadata", "L1third");
  const docSnapOneThird = await getDoc(docRefOneThird);

  const docRefTwoFirst = doc(db, "metadata", "L2first");
  const docSnapTwoFirst = await getDoc(docRefTwoFirst);
          
  const docRefTwoSecond = doc(db, "metadata", "L2second");
  const docSnapTwoSecond = await getDoc(docRefTwoSecond);
          
  const docRefTwoThree = doc(db, "metadata", "L2third");
  const docSnapTwoThird = await getDoc(docRefTwoThree);
      
  const docRefThreeFirst = doc(db, "metadata", "L3first");
  const docSnapThreeFirst = await getDoc(docRefThreeFirst);
      
  const docRefThreeSecond = doc(db, "metadata", "L3second");
  const docSnapThreeSecond = await getDoc(docRefThreeSecond);
          
  const docRefThreeThird = doc(db, "metadata", "L3third");
  const docSnapThreeThird = await getDoc(docRefThreeThird);

  //adds data to page
  var L1First = document.getElementById("firstLOne");
  if (L1First && docSnapOneFirst.exists()) L1First.innerHTML = docSnapOneFirst.data().clubName;

  var L1Second = document.getElementById("secondLOne");
  if (L1Second && docSnapOneSecond.exists()) L1Second.innerHTML = docSnapOneSecond.data().clubName;

  var L1Third = document.getElementById("thirdLOne");
  if (L1Third && docSnapOneThird.exists()) L1Third.innerHTML = docSnapOneThird.data().clubName;

  var L2First = document.getElementById("firstLTwo");
  if (L2First && docSnapTwoFirst.exists()) L2First.innerHTML = docSnapTwoFirst.data().clubName;
  
  var L2Second = document.getElementById("secondLTwo");
  if (L2Second && docSnapTwoSecond.exists()) L2Second.innerHTML = docSnapTwoSecond.data().clubName;

  var L2Third = document.getElementById("thirdLTwo");
  if (L2Third && docSnapTwoThird.exists()) L2Third.innerHTML = docSnapTwoThird.data().clubName;

  var L3First = document.getElementById("firstLThree");
  if (L3First && docSnapThreeFirst.exists()) L3First.innerHTML = docSnapThreeFirst.data().clubName;

  var L3Second = document.getElementById("secondLThree");
  if (L3Second && docSnapThreeSecond.exists()) L3Second.innerHTML = docSnapThreeSecond.data().clubName;

  var L3Third = document.getElementById("thirdLThree");
  if (L3Third && docSnapThreeThird.exists()) L3Third.innerHTML = docSnapThreeThird.data().clubName;

} 
