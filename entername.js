document.addEventListener("DOMContentLoaded", () => {
  // Firebase initialization
  const firebaseConfig = {
    apiKey: "AIzaSyAVeSrg9RpHmfO-mdMey9TuoEla-zlcTU0",
    authDomain: "dssdsd-bf4a8.firebaseapp.com",
    databaseURL: "https://dssdsd-bf4a8-default-rtdb.firebaseio.com",
    projectId: "dssdsd-bf4a8",
    storageBucket: "dssdsd-bf4a8.firebasestorage.app",
    messagingSenderId: "676931866710",
    appId: "1:676931866710:web:d29440a8fab9307f5aabf7",
    measurementId: "G-VZZ3EYD14T"
  };

  // Initialize Firebase using compat version
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Check if user is logged in
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // User is not logged in, redirect to login page
      window.location.href = "index.html";
    }
  });

  // Avatar selection
  const avatarOptions = document.querySelectorAll(".avatar-option");
  let selectedAvatar = "avatar1.png"; // Default avatar

  avatarOptions.forEach((option) => {
    option.addEventListener("click", function() {
      // Remove selected class from all options
      avatarOptions.forEach((opt) => opt.classList.remove("selected"));
      // Add selected class to clicked option
      this.classList.add("selected");
      // Update selected avatar
      selectedAvatar = this.getAttribute("data-avatar");
    });
  });

  // Continue button
  const continueButton = document.getElementById("continue-button");
  continueButton.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();

    if (!username) {
      const errorEl = document.getElementById("entername-error");
      errorEl.textContent = "Please enter your name";
      errorEl.classList.remove("hidden");
      return;
    }

    // Get current user
    const user = auth.currentUser;

    if (user) {
      // Save user profile to Firestore
      db.collection("users").doc(user.uid).set({
        name: username,
        avatar: selectedAvatar,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        // Redirect to chat page
        window.location.href = "chat.html";
      })
      .catch((error) => {
        const errorEl = document.getElementById("entername-error");
        errorEl.textContent = "Error saving profile: " + error.message;
        errorEl.classList.remove("hidden");
      });
    } else {
      // User is not logged in, redirect to login page
      window.location.href = "index.html";
    }
  });
});