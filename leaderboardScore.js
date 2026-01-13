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
  const type = docSnap.data().type;
  console.log(`[TYPE] ${type} | Club: ${username} | New Points: ${localPointTotal}`);

  if (type === "L1") {
    console.log("running L1 Leaderboard Update");
    
    const l1Refs = [
      doc(db, "metadata", "L1first"),
      doc(db, "metadata", "L1second"),
      doc(db, "metadata", "L1third"),
      doc(db, "metadata", "L1fourth"),
      doc(db, "metadata", "L1fifth")
    ];

    // Ensure all docs exist
    const l1Snaps = await Promise.all(l1Refs.map(ref => getDoc(ref)));
    const l1Ops = [];
    l1Snaps.forEach((snap, i) => {
      if (!snap.exists()) l1Ops.push(setDoc(l1Refs[i], { clubName: "", points: 0 }));
    });
    if (l1Ops.length) await Promise.all(l1Ops);

    // Get fresh data
    const l1Data = await Promise.all(l1Refs.map(async ref => (await getDoc(ref)).data() || { clubName: "", points: 0 }));

    let LOneArray = l1Data.map(d => ({ club: d.clubName, points: d.points }));
    console.log("L1 Array before editing:", JSON.stringify(LOneArray));
    
    const index1 = LOneArray.findIndex(entry => entry.club === docSnap.data().clubName);
    if (index1 !== -1) {
      LOneArray.splice(index1, 1);
    }
    
    LOneArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    LOneArray.sort((a, b) => b.points - a.points);
    console.log("L1 Array after sort:", JSON.stringify(LOneArray));

    await Promise.all(l1Refs.map((ref, i) => updateDoc(ref, {
      clubName: (LOneArray[i] && LOneArray[i].club) ? LOneArray[i].club : "",
      points: (LOneArray[i] && LOneArray[i].points) ? LOneArray[i].points : 0,
    })));
    
    console.log("DONE L1");
  }

  if (type === "L2") {
    console.log("running L2 Leaderboard Update");

    const l2Refs = [
      doc(db, "metadata", "L2first"),
      doc(db, "metadata", "L2second"),
      doc(db, "metadata", "L2third"),
      doc(db, "metadata", "L2fourth"),
      doc(db, "metadata", "L2fifth")
    ];

    // Ensure all docs exist
    const l2Snaps = await Promise.all(l2Refs.map(ref => getDoc(ref)));
    const l2Ops = [];
    l2Snaps.forEach((snap, i) => {
      if (!snap.exists()) l2Ops.push(setDoc(l2Refs[i], { clubName: "", points: 0 }));
    });
    if (l2Ops.length) await Promise.all(l2Ops);

    // Get fresh data
    const l2Data = await Promise.all(l2Refs.map(async ref => (await getDoc(ref)).data() || { clubName: "", points: 0 }));

    let LTwoArray = l2Data.map(d => ({ club: d.clubName, points: d.points }));
    console.log("L2 Array before editing:", JSON.stringify(LTwoArray));

    const index = LTwoArray.findIndex(entry => entry.club === docSnap.data().clubName);
    if (index !== -1) {
      LTwoArray.splice(index, 1);
    }
    
    LTwoArray.push({ club: docSnap.data().clubName, points: localPointTotal });
    LTwoArray.sort((a, b) => b.points - a.points);
    console.log("L2 Array after sort:", JSON.stringify(LTwoArray));

    await Promise.all(l2Refs.map((ref, i) => updateDoc(ref, {
      clubName: (LTwoArray[i] && LTwoArray[i].club) ? LTwoArray[i].club : "",
      points: (LTwoArray[i] && LTwoArray[i].points) ? LTwoArray[i].points : 0,
    })));

    console.log("DONE L2")
  }
}

//fucntion to add leaderboard to home page
export const loadLeaderboard = async function(){
  console.log("[LEADERBOARD] Sorting through club points to populate rankings...");
  
  try {
    const clubsCollection = collection(db, "clubs");
    const snapshot = await getDocs(clubsCollection);
    const allClubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Process L1
    const l1Clubs = allClubs
      .filter(c => c.type === "L1")
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const l1Ids = ["firstLOne", "secondLOne", "thirdLOne", "fourthsLOne", "fifthLOne"];
    l1Ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) {
          el.innerHTML = l1Clubs[i] && l1Clubs[i].clubName ? l1Clubs[i].clubName : "---";
      }
    });

    // Process L2
    const l2Clubs = allClubs
      .filter(c => c.type === "L2")
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const l2Ids = ["firstLTwo", "secondLTwo", "thirdLTwo", "fourthLTwo", "fifthLTwo"];
    l2Ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) {
          el.innerHTML = l2Clubs[i] && l2Clubs[i].clubName ? l2Clubs[i].clubName : "---";
      }
    });

    // Sync Metadata to keep cache updated
    const syncOps = [];
    const suffixes = ["first", "second", "third", "fourth", "fifth"];
    
    suffixes.forEach((suffix, i) => {
      const l1Ref = doc(db, "metadata", `L1${suffix}`);
      syncOps.push(setDoc(l1Ref, { 
        clubName: l1Clubs[i] ? l1Clubs[i].clubName : "", 
        points: l1Clubs[i] ? l1Clubs[i].points : 0 
      }));

      const l2Ref = doc(db, "metadata", `L2${suffix}`);
      syncOps.push(setDoc(l2Ref, { 
        clubName: l2Clubs[i] ? l2Clubs[i].clubName : "", 
        points: l2Clubs[i] ? l2Clubs[i].points : 0 
      }));
    });
    
    await Promise.all(syncOps);
    console.log("[LEADERBOARD] Rankings successfully updated and synced.");

  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
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
