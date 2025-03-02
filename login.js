document.addEventListener("DOMContentLoaded", () => {
  // Initialize Firebase (replace with your actual Firebase config)
  const firebaseConfig = {
    apiKey: "AIzaSyAVeSrg9RpHmfO-mdMey9TuoEla-zlcTU0",
    authDomain: "dssdsd-bf4a8.firebaseapp.com",
    databaseURL: "https://dssdsd-bf4a8-default-rtdb.firebaseio.com",
    projectId: "dssdsd-bf4a8",
    storageBucket: "dssdsd-bf4a8.firebasestorage.app",
    messagingSenderId: "676931866710",
    appId: "1:676931866710:web:d29440a8fab9307f5aabf7",
    measurementId: "G-VZZ3EYD14T"
  }

  firebase.initializeApp(firebaseConfig)

  const auth = firebase.auth()
  const db = firebase.firestore()

  // Check if user is already logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Check if user has a name set
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists && doc.data().name) {
            // User has a name, redirect to chat
            window.location.href = "chat.html"
          } else {
            // User doesn't have a name, redirect to name input
            window.location.href = "entername.html"
          }
        })
        .catch((error) => {
          console.error("Error checking user profile:", error)
          // If there's an error, redirect to name input to be safe
          window.location.href = "entername.html"
        })
    }
  })

  // Email login button
  const emailLoginBtn = document.getElementById("email-login")
  emailLoginBtn.addEventListener("click", () => {
    document.getElementById("email-form").classList.remove("hidden")
    document.getElementById("signup-form").classList.add("hidden")
    document.getElementById("login-options").classList.add("hidden")
  })

  // Microsoft login button
  const microsoftLoginBtn = document.getElementById("microsoft-login")
  microsoftLoginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.OAuthProvider("microsoft.com")
    auth
      .signInWithPopup(provider)
      .then((result) => {
        // Handle successful login
        console.log("Microsoft login successful")
      })
      .catch((error) => {
        // Handle errors
        document.getElementById("login-error").textContent = error.message
        document.getElementById("login-error").classList.remove("hidden")
      })
  })

  // Login form submission
  const loginForm = document.getElementById("login-submit")
  loginForm.addEventListener("click", (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if (!email || !password) {
      document.getElementById("login-error").textContent = "Please enter both email and password"
      document.getElementById("login-error").classList.remove("hidden")
      return
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Handle successful login
        console.log("Email login successful")
      })
      .catch((error) => {
        // Handle errors
        document.getElementById("login-error").textContent = error.message
        document.getElementById("login-error").classList.remove("hidden")
      })
  })

  // Sign up link
  const signupLink = document.getElementById("signup-link")
  signupLink.addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("email-form").classList.add("hidden")
    document.getElementById("signup-form").classList.remove("hidden")
  })

  // Login link
  const loginLink = document.getElementById("login-link")
  loginLink.addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("signup-form").classList.add("hidden")
    document.getElementById("email-form").classList.remove("hidden")
  })

  // Sign up form submission
  const signupSubmit = document.getElementById("signup-submit")
  signupSubmit.addEventListener("click", (e) => {
    e.preventDefault()

    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value
    const confirmPassword = document.getElementById("confirm-password").value

    if (!email || !password || !confirmPassword) {
      document.getElementById("login-error").textContent = "Please fill in all fields"
      document.getElementById("login-error").classList.remove("hidden")
      return
    }

    if (password !== confirmPassword) {
      document.getElementById("login-error").textContent = "Passwords do not match"
      document.getElementById("login-error").classList.remove("hidden")
      return
    }

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Handle successful signup
        console.log("Sign up successful")
      })
      .catch((error) => {
        // Handle errors
        document.getElementById("login-error").textContent = error.message
        document.getElementById("login-error").classList.remove("hidden")
      })
  })
})

const sentences = [
  "Welcome to AI Chat!",
  "Ask anything, and I'll assist you.",
  "Your Glide AI  is here to help.",
  "Get instant answers with AI-powered chat.",
  "Smart, fast, and always ready for you!",
  "AI-powered conversations at your fingertips.",
]

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("animated-text")
  
  if (!textElement) {
    console.error("Element with ID 'animated-text' not found!")
    return
  }
  
  let sentenceIndex = 0
  let charIndex = 0
  let isDeleting = false
  let isWaiting = false
  
  // Animation timing parameters
  const avgTypingSpeed = 70
  const typingVariation = 40
  const mistakeProbability = 0.01
  const pauseProbability = 0.05
  const pauseDuration = [100, 300]
  const deleteSpeed = 40
  const sentencePause = 1500
  const newSentencePause = 800
  
  function getRandomTypingSpeed() {
    return Math.max(30, avgTypingSpeed + (Math.random() * typingVariation * 2 - typingVariation))
  }
  
  function getRandomPauseDuration() {
    return pauseDuration[0] + Math.random() * (pauseDuration[1] - pauseDuration[0])
  }
  
  function simulateMistake(currentChar) {
    const commonTypos = {
      a: ["s", "q"], s: ["a", "d"], d: ["s", "f"], f: ["d", "g"],
      g: ["f", "h"], h: ["g", "j"], j: ["h", "k"], k: ["j", "l"],
      l: ["k", ";"], q: ["w", "a"], w: ["q", "e"], e: ["w", "r"],
      r: ["e", "t"], t: ["r", "y"], y: ["t", "u"], u: ["y", "i"],
      i: ["u", "o"], o: ["i", "p"], p: ["o", "["], z: ["x", "a"],
      x: ["z", "c"], c: ["x", "v"], v: ["c", "b"], b: ["v", "n"],
      n: ["b", "m"], m: ["n", ","]
    }
    
    if (commonTypos[currentChar.toLowerCase()]) {
      const possibleTypos = commonTypos[currentChar.toLowerCase()]
      return possibleTypos[Math.floor(Math.random() * possibleTypos.length)]
    }
    
    const chars = "abcdefghijklmnopqrstuvwxyz"
    return chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Update the display with current text - now handling spaces properly
  function updateDisplay(text) {
    // Clear previous content
    textElement.innerHTML = ""
    
    // Create each character with appropriate styling
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span")
      span.textContent = text[i]
      
      // Add highlight class to the last character if not deleting
      if (i === text.length - 1 && !isDeleting) {
        span.classList.add("highlight")
      }
      
      // If it's a space, add proper spacing class
      if (text[i] === " ") {
        span.classList.add("space")
      }
      
      textElement.appendChild(span)
    }
  }
  
  // Function to show a typo and then correct it
  function showTypoAndCorrect(currentText, position, originalChar) {
    const typo = simulateMistake(originalChar)
    
    // Create text with typo
    const mistakeText = currentText.substring(0, position) + typo
    
    // Show the typo
    textElement.innerHTML = ""
    for (let i = 0; i < mistakeText.length; i++) {
      const span = document.createElement("span")
      
      if (i === position) {
        span.textContent = typo
        span.classList.add("mistake")
      } else {
        span.textContent = mistakeText[i]
        if (mistakeText[i] === " ") {
          span.classList.add("space")
        }
      }
      
      textElement.appendChild(span)
    }
    
    // Schedule correction
    setTimeout(() => {
      charIndex++
      updateDisplay(sentences[sentenceIndex].substring(0, charIndex))
      setTimeout(typeEffect, getRandomTypingSpeed())
    }, 300)
  }
  
  // Main typing effect function
  function typeEffect() {
    const currentSentence = sentences[sentenceIndex]
    
    // Handle waiting state
    if (isWaiting) {
      isWaiting = false
      setTimeout(typeEffect, getRandomPauseDuration())
      return
    }
    
    // Handle deleting state
    if (isDeleting) {
      charIndex--
      updateDisplay(currentSentence.substring(0, charIndex))
      
      if (charIndex === 0) {
        isDeleting = false
        sentenceIndex = (sentenceIndex + 1) % sentences.length
        setTimeout(typeEffect, newSentencePause)
      } else {
        setTimeout(typeEffect, deleteSpeed)
      }
      return
    }
    
    // Handle typing state
    if (charIndex < currentSentence.length) {
      // Determine if we should make a typo (avoid typos on spaces)
      if (Math.random() < mistakeProbability && currentSentence[charIndex] !== " " && charIndex > 0) {
        showTypoAndCorrect(currentSentence.substring(0, charIndex), charIndex, currentSentence[charIndex])
      } else {
        // Regular typing
        charIndex++
        updateDisplay(currentSentence.substring(0, charIndex))
        
        // Occasionally pause while typing (especially after punctuation)
        const lastChar = currentSentence[charIndex - 1]
        const shouldPause = charIndex > 0 && 
                            (Math.random() < pauseProbability * 2 && ['.', ',', '!', '?'].includes(lastChar)) ||
                            (Math.random() < pauseProbability);
        
        if (shouldPause && charIndex < currentSentence.length) {
          isWaiting = true
        }
        
        setTimeout(typeEffect, getRandomTypingSpeed())
      }
    } else {
      // Finished typing the sentence
      setTimeout(() => {
        isDeleting = true
        typeEffect()
      }, sentencePause)
    }
  }
  
  // Start with a small delay
  setTimeout(typeEffect, 500)
})