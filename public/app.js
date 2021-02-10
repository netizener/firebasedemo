const auth = firebase.auth();
const db = firebase.firestore();

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const userDetails = document.getElementById("userDetails");

// use google auth
const provider = new firebase.auth.GoogleAuthProvider();
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {
  if (user) {
    //signed in
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}</h3>
        <p>User ID : ${user.uid}</p>`;
  } else {
    // not signed in
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = "";
  }
});

const createThing = document.getElementById("createThing");
const thingsList = document.getElementById("thingsList");

let thingsRef; // reference to a database location
let unsubscribe; // turn off realtime stream to mitigate excessive read/write

auth.onAuthStateChanged((user) => {
  if (user) {
    thingsRef = db.collection("things");
    createThing.onclick = () => {
        const {serverTimestamp} = firebase.firestore.FieldValue;
      thingsRef.add({
        uid: user.uid,
        name: faker.commerce.productName(),
        createdAt: serverTimestamp(), // consistent date/time accross regions instead of Date.now()
      });
    };

    unsubscribe = thingsRef.where('uid','==',user.uid).onSnapshot(querySnapshot=>{
        const items = querySnapshot.docs.map(doc=>{
            return `<li>${doc.data().name}</li>`
        });

        thingsList.innerHTML = items.join('');
    });
  } else {
      unsubscribe && unsubscribe();
  }
});
