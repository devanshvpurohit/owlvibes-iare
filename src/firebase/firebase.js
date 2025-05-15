

import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlNM-czij5SX5BMLaetTUq_wGi9IxWRtc",
  authDomain: "owlvibes-iare.firebaseapp.com",
  projectId: "owlvibes-iare",
  storageBucket: "owlvibes-iare.firebasestorage.app",
  messagingSenderId: "595916060737",
  appId: "1:595916060737:web:9babba7c0140e8c84d6ec0",
  measurementId: "G-N6NPW7H3KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const listenForChats = (setChats) => {
    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const filteredChats = chatList.filter((chat) => chat?.users?.some((user) => user.email === auth.currentUser.email));

        setChats(filteredChats);
    });

    return unsubscribe;
};

export const sendMessage = async (messageText, chatId, user1, user2) => {
    const chatRef = doc(db, "chats", chatId);

    const user1Doc = await getDoc(doc(db, "users", user1));
    const user2Doc = await getDoc(doc(db, "users", user2));

    console.log(user1Doc);
    console.log(user2Doc);

    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();

    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
        await setDoc(chatRef, {
            users: [user1Data, user2Data],
            lastMessage: messageText,
            lastMessageTimestamp: serverTimestamp(),
        });
    } else {
        await updateDoc(chatRef, {
            lastMessage: messageText,
            lastMessageTimestamp: serverTimestamp(),
        });
    }

    const messageRef = collection(db, "chats", chatId, "messages");

    await addDoc(messageRef, {
        text: messageText,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp(),
    });
};

export const listenForMessages = (chatId, setMessages) => {
    const chatRef = collection(db, "chats", chatId, "messages");
    onSnapshot(chatRef, (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data());
        setMessages(messages);
    });
};

// Function to update user images (Note, we did not use this function in the project tutorial)
// export async function updateUsersImages() {
//     // Step 1: Fetch the users collection from Firestore
//     const usersRef = collection(db, "users");
//     const querySnapshot = await getDocs(usersRef);

//     // Step 2: Loop through the users and update the image field using `for...of`
//     let index = 1; // Start with img=1

//     // Use a for...of loop to handle async calls sequentially
//     for (const docSnapshot of querySnapshot.docs) {
//         const userDoc = doc(db, "users", docSnapshot.id);

//         // Construct the new image URL
//         const imageUrl = `https://i.pravatar.cc/150?img=${index}`;

//         // Step 3: Update the user document with the new image URL
//         await updateDoc(userDoc, {
//             image: imageUrl, // assuming 'image' is the field to update
//         });

//         index++; // Increment the image number for the next user
//     }

//     console.log("All user images updated successfully!");
// }

export { auth, db };
