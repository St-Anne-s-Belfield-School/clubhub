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
  
  console.log(`[FUNCTION CALLED] updatePoints invoked for club: ${clubUsername}`);
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
  console.log(`[CURRENT POINTS] Club "${docSnap.data().clubName}" currently has: ${pointTotal} points`);
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

  console.log(`[BEFORE UPLOAD] Club "${docSnap.data().clubName}" points: ${pointTotal}`);
  
  await updateDoc(doc(db, "clubs", username), {
    //adding newly calculated pt total additions from this meeting
      points: localPointTotal,
  });

  console.log(`[AFTER UPLOAD] Club "${docSnap.data().clubName}" points: ${localPointTotal}`);
  console.log("did you make it?");

  ////comparing with leaderboards:::
  //getting leaderboard point totals (1st-3rd places for L1, L2 and L3 clubs)
  const docRefOneFirst = doc(db, "metadata", "L1first");
  const docSnapOneFirst = await getDoc(docRefOneFirst);
  const pointL1First = (docSnapOneFirst.data() || {}).points || 0;
  const nameL1First = (docSnapOneFirst.data() || {}).clubName || "";

  const docRefOneSecond = doc(db, "metadata", "L1second");
  const docSnapOneSecond = await getDoc(docRefOneSecond);
  const pointL1Second = (docSnapOneSecond.data() || {}).points || 0;
  const nameL1second = (docSnapOneSecond.data() || {}).clubName || "";

  const docRefOneThird = doc(db, "metadata", "L1third");
  const docSnapOneThird = await getDoc(docRefOneThird);
  const pointL1Third = (docSnapOneThird.data() || {}).points || 0;
  const nameL1third = (docSnapOneThird.data() || {}).clubName || "";

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



  const type = docSnap.data().type;
  console.log(type);
  console.log(username);
  console.log(localPointTotal);

  if (type === "L1") {
    console.log("running L1");
    
    const l1firstRef = doc(db, "metadata", "L1first");
    const l1secondRef = doc(db, "metadata", "L1second");
    const l1thirdRef = doc(db, "metadata", "L1third");

    const [l1FirstSnap, l1SecondSnap, l1ThirdSnap] = await Promise.all([
      getDoc(l1firstRef),
      getDoc(l1secondRef),
      getDoc(l1thirdRef)
    ]);

    const l1Ops = [];
    if (!l1FirstSnap.exists()) l1Ops.push(setDoc(l1firstRef, { clubName: "", points: 0 }));
    if (!l1SecondSnap.exists()) l1Ops.push(setDoc(l1secondRef, { clubName: "", points: 0 }));
    if (!l1ThirdSnap.exists()) l1Ops.push(setDoc(l1thirdRef, { clubName: "", points: 0 }));
    if (l1Ops.length) await Promise.all(l1Ops);

    const l1FirstData = (await getDoc(l1firstRef)).data() || { clubName: "", points: 0 };
    const l1SecondData = (await getDoc(l1secondRef)).data() || { clubName: "", points: 0 };
    const l1ThirdData = (await getDoc(l1thirdRef)).data() || { clubName: "", points: 0 };

    let LOneArray = [
      { club: l1FirstData.clubName, points: l1FirstData.points },
      { club: l1SecondData.clubName, points: l1SecondData.points },
      { club: l1ThirdData.clubName, points: l1ThirdData.points }
    ];
    console.log(LOneArray + "before editing");
    
    const index1 = LOneArray.findIndex(entry => entry.club === docSnap.data().clubName);
    if (index1 !== -1) {
      LOneArray.splice(index1, 1);
    }
    console.log(LOneArray + "after filter");
    
    LOneArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    console.log(LOneArray + "after push");
    
    LOneArray.sort((a, b) => b.points - a.points);
    console.log(LOneArray + "after sort");

    await updateDoc(l1firstRef, {
      clubName: LOneArray[0].club,
      points: LOneArray[0].points,
    });
    await updateDoc(l1secondRef, {
      clubName: LOneArray[1].club,
      points: LOneArray[1].points,
    });
    await updateDoc(l1thirdRef, {
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
      
  // const docRefThreeFirst = doc(db, "metadata", "L3first");
  // const docSnapThreeFirst = await getDoc(docRefThreeFirst);
      
  // const docRefThreeSecond = doc(db, "metadata", "L3second");
  // const docSnapThreeSecond = await getDoc(docRefThreeSecond);
          
  // const docRefThreeThird = doc(db, "metadata", "L3third");
  // const docSnapThreeThird = await getDoc(docRefThreeThird);

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

  // var L3First = document.getElementById("firstLThree");
  // if (L3First && docSnapThreeFirst.exists()) L3First.innerHTML = docSnapThreeFirst.data().clubName;

  // var L3Second = document.getElementById("secondLThree");
  // if (L3Second && docSnapThreeSecond.exists()) L3Second.innerHTML = docSnapThreeSecond.data().clubName;

  // var L3Third = document.getElementById("thirdLThree");
  // if (L3Third && docSnapThreeThird.exists()) L3Third.innerHTML = docSnapThreeThird.data().clubName;

}

//allows user to see their any club's point total... 
// must be on a page where leaderbaord.js has been loaded/run
export const getClubPoints = async function(clubName) {
  console.log(`Getting points for club: ${clubName}`);
  try {
    const clubsCollection = collection(db, "clubs");
    const querySnapshot = await getDocs(clubsCollection);
    
    for (const docSnap of querySnapshot.docs) {
      if (docSnap.data().clubName === clubName) {
        const points = docSnap.data().points;
        console.log(`Club "${clubName}" current points: ${points}`);
        return points;
      }
    }
    console.log(`Club "${clubName}" not found`);
    return null;
  } catch (error) {
    console.error(`Error fetching points for ${clubName}:`, error);
    return null;
  }
}
//allows user to manually change points if there is a major error 
// (not the safest as right no anyone who new how to code 
// well enough maybe able to find this, but it's unlikely)
export async function setClubPoints(clubName, newPoints) {
  try {
    console.log(`[MANUAL UPDATE] Setting points for "${clubName}" to ${newPoints}`);

    const clubsCollection = collection(db, "clubs");
    const snapshot = await getDocs(clubsCollection);

    for (const docSnap of snapshot.docs) {
      if (docSnap.data().clubName === clubName) {
        const clubRef = doc(db, "clubs", docSnap.id);

        await updateDoc(clubRef, { points: newPoints });

        console.log(`[SUCCESS] Updated "${clubName}" to ${newPoints} points`);
        return true;
      }
    }

    console.log(`[FAILED] Club "${clubName}" not found`);
    return false;

  } catch (err) {
    console.error("Error updating points:", err);
  }
}
