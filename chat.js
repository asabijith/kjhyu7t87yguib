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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking authentication...");

  // Initialize variables to track current chat
  let currentChatId = null;

  // Check if user is logged in
  auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User not logged in");
      
      if (!user) {
          // User is not logged in, redirect to login page
          console.log("No user found, redirecting to index.html");
          window.location.href = "index.html";
          return;
      }

      // Get user profile
      console.log("Fetching user profile for:", user.uid);
      db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
              if (doc.exists) {
                  const userData = doc.data();
                  console.log("User data retrieved:", userData);

                  // Check if user has a name
                  if (!userData.name) {
                      // User doesn't have a name, redirect to name input
                      console.log("User has no name, redirecting to entername.html");
                      window.location.href = "entername.html";
                      return;
                  }

                  // Fix avatar path - ensure proper image path
                  const avatarSrc = userData.avatar && userData.avatar.startsWith('http') 
                      ? userData.avatar 
                      : userData.avatar || "avatar1.png";

                  // Display user profile
                  const userProfileElement = document.getElementById("user-profile");
                  userProfileElement.innerHTML = `
                      <div class="user-avatar">
                          <img src="${avatarSrc}" alt="${userData.name}">
                      </div>
                      <div class="user-name">${userData.name}</div>
                  `;

                  // Load chat history
                  loadChatHistory(user.uid);
                  
                  // Initialize example prompts
                  initializeExamplePrompts();
              } else {
                  // User profile doesn't exist, redirect to name input
                  console.log("User profile doesn't exist, redirecting to entername.html");
                  window.location.href = "entername.html";
              }
          })
          .catch((error) => {
              console.error("Error getting user profile:", error);
          });
  });

  // Load chat history
  function loadChatHistory(userId) {
      console.log("Loading chat history for user:", userId);
      db.collection("chats")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              const chatHistoryElement = document.getElementById("chat-history");
              chatHistoryElement.innerHTML = "";

              if (querySnapshot.empty) {
                  console.log("No chat history found");
                  // No chat history
                  return;
              }

              console.log("Chat history found, items:", querySnapshot.size);
              querySnapshot.forEach((doc) => {
                  const chatData = doc.data();
                  const chatItem = document.createElement("div");
                  chatItem.className = "chat-item";
                  chatItem.textContent = chatData.title || "New Chat";
                  chatItem.setAttribute("data-id", doc.id);

                  chatItem.addEventListener("click", () => {
                      loadChat(doc.id);
                  });

                  chatHistoryElement.appendChild(chatItem);
              });
          })
          .catch((error) => {
              console.error("Error loading chat history:", error);
          });
  }

  // Load specific chat
  function loadChat(chatId) {
      console.log("Loading chat:", chatId);
      // Update current chat ID
      currentChatId = chatId;
      
      // Update active chat
      const chatItems = document.querySelectorAll(".chat-item");
      chatItems.forEach((item) => {
          if (item.getAttribute("data-id") === chatId) {
              item.classList.add("active");
          } else {
              item.classList.remove("active");
          }
      });

      // Clear messages container
      const messagesContainer = document.getElementById("messages-container");
      messagesContainer.innerHTML = "";

      // Load chat messages
      db.collection("chats")
          .doc(chatId)
          .get()
          .then((chatDoc) => {
              if (chatDoc.exists) {
                  const chatData = chatDoc.data();
                  console.log("Chat data loaded:", chatData);

                  // Update chat title
                  document.getElementById("current-chat-title").textContent = chatData.title || "New Chat";

                  // Load messages
                  db.collection("chats")
                      .doc(chatId)
                      .collection("messages")
                      .orderBy("timestamp", "asc")
                      .get()
                      .then((querySnapshot) => {
                          console.log("Messages loaded, count:", querySnapshot.size);
                          
                          if (querySnapshot.empty) {
                              console.log("No messages in this chat");
                              return;
                          }
                          
                          querySnapshot.forEach((doc) => {
                              const messageData = doc.data();
                              addMessageToUI(
                                  messageData.role, 
                                  messageData.content, 
                                  messageData.avatar || (messageData.role === "assistant" ? "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0" : "avatar1.png"), 
                                  messageData.name || (messageData.role === "assistant" ? "Glide AI " : "You")
                              );
                          });

                          // Scroll to bottom
                          messagesContainer.scrollTop = messagesContainer.scrollHeight;
                      })
                      .catch((error) => {
                          console.error("Error loading messages:", error);
                      });
              } else {
                  console.log("Chat document doesn't exist");
              }
          })
          .catch((error) => {
              console.error("Error loading chat:", error);
          });
  }

// New chat button
document.getElementById("new-chat").addEventListener("click", () => {
    console.log("New chat button clicked");
    // Clear current chat ID
    currentChatId = null;
    
    // Clear messages container
    const messagesContainer = document.getElementById("messages-container");
    messagesContainer.innerHTML = `
        <div class="welcome-message">
            <h1>How can I assist with your travel plans today?</h1>
            <p>Ask me anything about travel or try these examples:</p>
            <div class="example-prompts">
                <button class="example-prompt">What are the best beaches in Thailand?</button>
                <button class="example-prompt">Suggest a 7-day itinerary for Rome</button>
                <button class="example-prompt">What's the best time to visit Japan?</button>
                <button class="example-prompt">Budget travel tips for Europe</button>
            </div>
        </div>
    `;

    // Update chat title
    document.getElementById("current-chat-title").textContent = "New Travel Chat";

    // Remove active class from all chat items
    const chatItems = document.querySelectorAll(".chat-item");
    chatItems.forEach((item) => {
        item.classList.remove("active");
    });

    // Initialize example prompts
    initializeExamplePrompts();
});
  // Logout button
  document.getElementById("logout-button").addEventListener("click", () => {
      console.log("Logout button clicked");
      auth
          .signOut()
          .then(() => {
              window.location.href = "index.html";
          })
          .catch((error) => {
              console.error("Error signing out:", error);
          });
  });

  // Message input
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  messageInput.addEventListener("input", function () {
      // Enable send button if input is not empty
      sendButton.disabled = this.value.trim() === "";

      // Auto-resize textarea
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
  });

  messageInput.addEventListener("keydown", (e) => {
      // Send message on Enter key (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!sendButton.disabled) {
              sendButton.click();
          }
      }
  });

  // Send button
  sendButton.addEventListener("click", () => {
      const message = messageInput.value.trim();
      console.log("Send button clicked with message:", message.substring(0, 30) + (message.length > 30 ? "..." : ""));

      if (!message) {
          console.log("Empty message, not sending");
          return;
      }

      // Get current user
      const user = auth.currentUser;

      if (!user) {
          console.log("No user authenticated, cannot send message");
          alert("You must be logged in to send messages");
          window.location.href = "index.html";
          return;
      }

      // Get user profile
      db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
              if (doc.exists) {
                  const userData = doc.data();
                  console.log("User data for message:", userData);

                  // Fix avatar path
                  const avatarSrc = userData.avatar && userData.avatar.startsWith('http') 
                      ? userData.avatar 
                      : userData.avatar || "avatar1.png";

                  // Use the stored currentChatId
                  console.log("Current chat ID from variable:", currentChatId);

                  // Clear input before adding message to prevent double-sends
                  const messageToSend = message; // Store message before clearing input
                  messageInput.value = "";
                  messageInput.style.height = "auto";
                  sendButton.disabled = true;

                  // Remove welcome message if it exists
                  const welcomeMessage = document.querySelector(".welcome-message");
                  if (welcomeMessage) {
                      welcomeMessage.remove();
                  }

                  if (!currentChatId) {
                      // Create new chat
                      console.log("Creating new chat");
                      createNewChat(user.uid, messageToSend).then((newChatId) => {
                          // Add user message to UI immediately
                          addMessageToUI("user", messageToSend, avatarSrc, userData.name);
                          
                          // Add to database
                          addMessage(newChatId, "user", messageToSend, avatarSrc, userData.name).then(() => {
                              // Show typing indicator
                              showTypingIndicator();

                              // Get AI response
                              console.log("Getting AI response");
                              getAIResponse(messageToSend).then((response) => {
                                  // Hide typing indicator
                                  hideTypingIndicator();

                                  // Add AI message
                                  console.log("Adding AI response to chat");
                                  addMessage(newChatId, "assistant", response, "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0", "Glide AI ").then(() => {
                                      // Add message to UI
                                      addMessageToUI("assistant", response, "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0", "Glide AI ");
                                  });
                              });
                          });
                      });
                  } else {
                      // Add user message to existing chat
                      console.log("Adding user message to existing chat:", currentChatId);
                      
                      // Add message to UI immediately
                      addMessageToUI("user", messageToSend, avatarSrc, userData.name);
                      
                      // Add to database
                      addMessage(currentChatId, "user", messageToSend, avatarSrc, userData.name).then(() => {
                          // Show typing indicator
                          showTypingIndicator();

                          // Get AI response
                          console.log("Getting AI response");
                          getAIResponse(messageToSend).then((response) => {
                              // Hide typing indicator
                              hideTypingIndicator();

                              // Add AI message
                              console.log("Adding AI response to chat");
                              addMessage(currentChatId, "assistant", response, "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0", "Glide AI ").then(() => {
                                  // Add message to UI
                                  addMessageToUI("assistant", response, "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0", "Glide AI ");
                              });
                          });
                      });
                  }
              } else {
                  console.log("User document doesn't exist");
                  alert("User profile not found. Please log in again.");
                  auth.signOut().then(() => {
                      window.location.href = "index.html";
                  });
              }
          })
          .catch(error => {
              console.error("Error getting user data for message:", error);
              alert("Error sending message. Please try again.");
          });
  });

  // Create new chat
  function createNewChat(userId, firstMessage) {
      return new Promise((resolve, reject) => {
          // Create chat document
          db.collection("chats")
              .add({
                  userId: userId,
                  title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : ""),
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
              })
              .then((docRef) => {
                  // Update current chat ID
                  currentChatId = docRef.id;
                  
                  // Add chat to history
                  const chatHistoryElement = document.getElementById("chat-history");
                  const chatItem = document.createElement("div");
                  chatItem.className = "chat-item active";
                  chatItem.textContent = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "");
                  chatItem.setAttribute("data-id", docRef.id);

                  chatItem.addEventListener("click", () => {
                      loadChat(docRef.id);
                  });

                  // Remove active class from all chat items
                  const chatItems = document.querySelectorAll(".chat-item");
                  chatItems.forEach((item) => {
                      item.classList.remove("active");
                  });

                  // Add new chat item to the top
                  if (chatHistoryElement.firstChild) {
                      chatHistoryElement.insertBefore(chatItem, chatHistoryElement.firstChild);
                  } else {
                      chatHistoryElement.appendChild(chatItem);
                  }

                  // Update chat title
                  document.getElementById("current-chat-title").textContent =
                      firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "");

                  resolve(docRef.id);
              })
              .catch((error) => {
                  console.error("Error creating chat:", error);
                  reject(error);
              });
      });
  }

  // Add message to database
  function addMessage(chatId, role, content, avatar, name) {
      // Update the chat's lastUpdated field
      db.collection("chats").doc(chatId).update({
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return db.collection("chats").doc(chatId).collection("messages").add({
          role: role,
          content: content,
          avatar: avatar || (role === "assistant" ? "https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0" : "avatar1.png"),
          name: name || (role === "assistant" ? "Glide AI " : "User"),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  // Add message to UI
  function addMessageToUI(role, content, avatar, name) {
      const messagesContainer = document.getElementById("messages-container");

      // Remove welcome message if it exists
      const welcomeMessage = document.querySelector(".welcome-message");
      if (welcomeMessage) {
          welcomeMessage.remove();
      }

      // Create message element
      const messageElement = document.createElement("div");
      messageElement.className = `message ${role}-message`;

      // Ensure avatar has a valid path
      const avatarSrc = (avatar && avatar.startsWith('http')) 
          ? avatar 
          : (avatar || (role === "assistant" ? "https://www.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0https://dl.dropbox.com/scl/fi/v4dcw51w1z8tmdynh8o5x/Propeller.gif?rlkey=t2n4643e1k832kw713a5au1a7&st=4egrrkz7&dl=0" : "avatar1.png"));

      messageElement.innerHTML = `
          <div class="message-avatar">
              <img src="${avatarSrc}" alt="${name || (role === 'assistant' ? 'Glide AI ' : 'User')}">
          </div>
          <div class="message-content">
              <div class="message-header">
                  <div class="message-name">${name || (role === 'assistant' ? 'Glide AI ' : 'User')}</div>
              </div>
              <div class="message-text">${formatMessage(content)}</div>
          </div>
      `;

      // Append message to container
      messagesContainer.appendChild(messageElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Format message (convert newlines to <br> and handle code blocks)
  function formatMessage(text) {
      if (!text) return '';
      
      // Replace newlines with <br>
      let formattedText = text.replace(/\n/g, "<br>");

      // Handle code blocks (more robust implementation)
      formattedText = formattedText.replace(/```([\s\S]*?)```/g, function(match, code) {
          // Remove the first <br> if it exists (from the newline after the opening ```)
          code = code.replace(/^<br>/, '');
          // Remove the last <br> if it exists (from the newline before the closing ```)
          code = code.replace(/<br>$/, '');
          return `<pre><code>${code}</code></pre>`;
      });

      // Handle inline code
      formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');

      return formattedText;
  }

  // Show typing indicator
  function showTypingIndicator() {
      const messagesContainer = document.getElementById("messages-container");

      // Remove existing typing indicator if any
      hideTypingIndicator();

      // Create typing indicator
      const typingElement = document.createElement("div");
      typingElement.className = "message assistant-message typing-message";
      typingElement.id = "typing-indicator";

      typingElement.innerHTML = `
          <div class="message-avatar">
              <span class="fluent-color--bot-sparkle-24"></span>
          </div>
          <div class="message-content">
              <div class="message-header">
                  <div class="message-name">Glide AI </div>
              </div>
              <div class="typing-indicator">
                 <span class="svg-spinners--gooey-balls-1"></span>
              </div>
          </div>
      `;

      // Append typing indicator to container
      messagesContainer.appendChild(typingElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTypingIndicator() {
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) {
          typingIndicator.remove();
      }
  }


    // Get AI response with instruction to use proper formatting
function getAIResponse(message) {
    return new Promise((resolve, reject) => {
        // Get chat history for context
        const messagesContainer = document.getElementById("messages-container");
        const messageElements = messagesContainer.querySelectorAll(".message:not(.typing-message)");

        // Build conversation history (last 10 messages)
        const conversationHistory = [];
        const maxMessages = 10;
        const startIndex = Math.max(0, messageElements.length - maxMessages);

        for (let i = startIndex; i < messageElements.length; i++) {
            const element = messageElements[i];
            const role = element.classList.contains("user-message") ? "user" : "model";
            const content = element.querySelector(".message-text").innerText;

            conversationHistory.push({
                role: role,
                parts: [{ text: content }],
            });
        }

        // Add current message
        conversationHistory.push({
            role: "user",
            parts: [{ text: message }],
        });

        console.log("Making API request to Gemini with conversation history length:", conversationHistory.length);

        // Make API request to Gemini
        fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC37To3NDhyBOaARmZgwm8Wykvx67uqNag",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: conversationHistory,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ],
                    systemInstruction: {
                        role: "system",
                        parts: [{ text: `You are a friendly and helpful travel assistant. 
                        
1. Respond to all travel-related questions with accurate and useful information.
2. Be conversational and engaging.
3. Format your responses attractively:
   - Use **bold text** for emphasis and headings
   - Use bullet points or numbered lists for multiple items
   - Organize information in a clear, scannable format
   - Break up long responses into logical sections
   - Use markdown formatting where appropriate

If users ask about topics unrelated to travel, politely guide them back to travel topics by suggesting related travel questions they might want to ask instead.` }]
                    }
                }),
            }
        )
            .then((response) => {
                console.log("API response status:", response.status);
                return response.json();
            })
            .then((data) => {
                console.log("API response received:", data);
                
                if (
                    data.candidates &&
                    data.candidates.length > 0 &&
                    data.candidates[0].content &&
                    data.candidates[0].content.parts &&
                    data.candidates[0].content.parts.length > 0
                ) {
                    const responseText = data.candidates[0].content.parts[0].text;
                    resolve(responseText);
                } else if (data.error) {
                    console.error("API error:", data.error);
                    resolve("I'm sorry, I couldn't answer your travel question due to a technical issue. Please try asking about your destination or travel plans again in a different way.");
                } else {
                    console.error("Unexpected API response format:", data);
                    resolve("I'd love to help with your travel plans! Could you please rephrase your question about destinations, accommodations, or activities?");
                }
            })
            .catch((error) => {
                console.error("Error calling Gemini API:", error);
                // Fallback response if API fails
                resolve("I'm having trouble connecting to my travel database right now. Please ask me about your travel plans again in a moment.");
            });
    });
}
  // Initialize example prompts
  function initializeExamplePrompts() {
      const examplePrompts = document.querySelectorAll(".example-prompt");
      examplePrompts.forEach((prompt) => {
          prompt.addEventListener("click", function () {
              const messageInput = document.getElementById("message-input");
              messageInput.value = this.textContent;
              messageInput.dispatchEvent(new Event("input"));
              document.getElementById("send-button").disabled = false;
          });
      });
  }

  // Initial setup for example prompts
  initializeExamplePrompts();
});

// Add this to your existing JavaScript file, inside the document ready function

const aviationStackApiKey = "a1af802985fcaac7ba11dbdf76a8d7cb"; // Replace with your actual API key

// Flight search functionality
function initializeFlightSearch() {
    // DOM elements
    const flightSearchButton = document.getElementById("flight-search-button");
    const flightSearchContainer = document.getElementById("flight-search-container");
    const closeFlightSearch = document.getElementById("close-flight-search");
    const searchFlightButton = document.getElementById("search-flight-button");
    const flightTabs = document.querySelectorAll(".flight-tab");
    const flightResults = document.getElementById("flight-results");
    
    // Create overlay element
    const overlay = document.createElement("div");
    overlay.className = "flight-search-overlay";
    document.body.appendChild(overlay);
    
    // Populate date select options
    populateDateSelects();
    
    // Show flight search
    flightSearchButton.addEventListener("click", () => {
        flightSearchContainer.classList.add("active");
        overlay.classList.add("active");
    });
    
    // Close flight search
    closeFlightSearch.addEventListener("click", () => {
        flightSearchContainer.classList.remove("active");
        overlay.classList.remove("active");
    });
    
    // Close on overlay click
    overlay.addEventListener("click", () => {
        flightSearchContainer.classList.remove("active");
        overlay.classList.remove("active");
    });
    
    // Switch tabs
    flightTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            flightTabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Get tab type and load the appropriate data
            const tabType = tab.getAttribute("data-tab");
            if (tabType === "upcoming") {
                loadUpcomingFlights();
            } else if (tabType === "recent") {
                loadRecentFlights();
            }
        });
    });
    
    // Search for a flight
    searchFlightButton.addEventListener("click", () => {
        const flightNumber = document.getElementById("flight-number").value.trim();
        const day = document.getElementById("flight-date-day").value;
        const month = document.getElementById("flight-date-month").value;
        const year = document.getElementById("flight-date-year").value;
        
        if (!flightNumber) {
            alert("Please enter a flight number");
            return;
        }
        
        // Show loading state
        showFlightLoadingState("loading");
        
        // Create a date string if all parts are provided
        let dateStr = "";
        if (day && month && year) {
            dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        // Search flight
        searchFlight(flightNumber, dateStr);
    });
    
    // Load default tab content (upcoming flights)
    loadUpcomingFlights();
}

// Populate date select options
function populateDateSelects() {
    const daySelect = document.getElementById("flight-date-day");
    const monthSelect = document.getElementById("flight-date-month");
    const yearSelect = document.getElementById("flight-date-year");
    
    // Days 1-31
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Months 1-12 with names
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i} - ${monthNames[i-1]}`;
        monthSelect.appendChild(option);
    }
    
    // Current year and next year
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 1; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

// Search for a specific flight
function searchFlight(flightNumber, date) {
    console.log(`Searching for flight: ${flightNumber}, Date: ${date || 'any'}`);
    
    // Construct the API URL using HTTPS
    let apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${aviationStackApiKey}&flight_iata=${flightNumber}`;
    if (date) {
        apiUrl += `&flight_date=${date}`;
    }
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                showFlightLoadingState("error");
                return;
            }
            
            if (!data.data || data.data.length === 0) {
                showFlightLoadingState("no-results");
                return;
            }
            
            renderFlightResults(data.data);
        })
        .catch(error => {
            console.error("Error fetching flight data:", error);
            showFlightLoadingState("error");
        });
}

// Load upcoming flights
function loadUpcomingFlights() {
    console.log("Loading upcoming flights");
    showFlightLoadingState("loading");
    
    // Format today's date as YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // API call for upcoming flights using HTTPS
    fetch(`https://api.aviationstack.com/v1/flights?access_key=${aviationStackApiKey}&flight_status=scheduled&flight_date=${dateStr}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                showFlightLoadingState("error");
                return;
            }
            
            if (!data.data || data.data.length === 0) {
                showFlightLoadingState("no-results");
                return;
            }
            
            renderFlightResults(data.data);
        })
        .catch(error => {
            console.error("Error fetching upcoming flights:", error);
            showFlightLoadingState("error");
        });
}

// Load recent flights
function loadRecentFlights() {
    console.log("Loading recent flights");
    showFlightLoadingState("loading");
    
    // Format yesterday's date as YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // API call for recent flights using HTTPS
    fetch(`https://api.aviationstack.com/v1/flights?access_key=${aviationStackApiKey}&flight_date=${dateStr}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                showFlightLoadingState("error");
                return;
            }
            
            if (!data.data || data.data.length === 0) {
                showFlightLoadingState("no-results");
                return;
            }
            
            renderFlightResults(data.data);
        })
        .catch(error => {
            console.error("Error fetching recent flights:", error);
            showFlightLoadingState("error");
        });
}

// Show appropriate loading state
function showFlightLoadingState(state) {
    const flightResults = document.getElementById("flight-results");
    const loadingElement = flightResults.querySelector(".flight-loading");
    const noResultsElement = flightResults.querySelector(".flight-no-results");
    const errorElement = flightResults.querySelector(".flight-error");
    
    // Hide all states if they exist
    if (loadingElement) loadingElement.classList.add("hidden");
    if (noResultsElement) noResultsElement.classList.add("hidden");
    if (errorElement) errorElement.classList.add("hidden");
    
    // Clear previous results
    const flightCards = flightResults.querySelectorAll(".flight-card");
    flightCards.forEach(card => card.remove());
    
    // Show the relevant state element
    if (state === "loading" && loadingElement) {
        loadingElement.classList.remove("hidden");
    } else if (state === "no-results" && noResultsElement) {
        noResultsElement.classList.remove("hidden");
    } else if (state === "error" && errorElement) {
        errorElement.classList.remove("hidden");
    }
}

// Render flight results
function renderFlightResults(flights) {
    const flightResults = document.getElementById("flight-results");
    
    // Hide any loading or state messages
    showFlightLoadingState("");
    
    // Limit the number of flights for performance
    const limitedFlights = flights.slice(0, 10);
    
    limitedFlights.forEach(flight => {
        const departureAirport = flight.departure.airport || "N/A";
        const departureIata = flight.departure.iata || "N/A";
        const arrivalAirport = flight.arrival.airport || "N/A";
        const arrivalIata = flight.arrival.iata || "N/A";
        const flightNumber = `${flight.airline.iata || ''}-${flight.flight.number || 'N/A'}`;
        const status = flight.flight_status || "scheduled";
        
        const flightCard = document.createElement("div");
        flightCard.className = "flight-card";
        
        flightCard.innerHTML = `
            <div class="flight-header">
                <div class="flight-number">${flightNumber}</div>
                <div class="flight-status ${status}">${capitalizeFirstLetter(status)}</div>
            </div>
            <div class="flight-route">
                <div class="flight-airport">
                    <div class="flight-airport-code">${departureIata}</div>
                    <div class="flight-airport-name">${departureAirport}</div>
                </div>
                <div class="flight-route-line">
                    <div class="flight-route-line-inner">
                        <span class="flight-route-plane">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                            </svg>
                        </span>
                    </div>
                </div>
                <div class="flight-airport">
                    <div class="flight-airport-code">${arrivalIata}</div>
                    <div class="flight-airport-name">${arrivalAirport}</div>
                </div>
            </div>
            <div class="flight-details">
                <div class="flight-detail-item">
                    <div class="flight-detail-label">Departure</div>
                    <div class="flight-detail-value">${formatTime(flight.departure.scheduled)}</div>
                </div>
                <div class="flight-detail-item">
                    <div class="flight-detail-label">Arrival</div>
                    <div class="flight-detail-value">${formatTime(flight.arrival.scheduled)}</div>
                </div>
                <div class="flight-detail-item">
                    <div class="flight-detail-label">Airline</div>
                    <div class="flight-detail-value">${flight.airline.name || 'N/A'}</div>
                </div>
                <div class="flight-detail-item">
                    <div class="flight-detail-label">Terminal</div>
                    <div class="flight-detail-value">${flight.departure.terminal || 'N/A'}</div>
                </div>
            </div>
        `;
        
        flightResults.appendChild(flightCard);
    });
}

// Format time from an ISO string
function formatTime(isoString) {
    if (!isoString) return "N/A";
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
        return "N/A";
    }
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize flight search when the document is ready
document.addEventListener("DOMContentLoaded", () => {
    initializeFlightSearch();
});
   // DOM Elements
   const weatherButton = document.getElementById('weather-button');
   const weatherContainer = document.getElementById('weather-container');
   const closeWeatherButton = document.getElementById('close-weather');
   const weatherSearchInput = document.getElementById('weather-search-input');
   const weatherSearchButton = document.getElementById('weather-search-button');
   const weatherLoader = document.getElementById('weather-loader');
   const weatherMessage = document.getElementById('weather-message');
   const weatherContent = document.getElementById('weather-content');
   const messageInput = document.getElementById('message-input');
   const sendButton = document.getElementById('send-button');
   
   // API Key
   const apiKey = "271c14299ddf46f38b5161439250103";
   
   // Cities for random weather
   const cities = [
       "New York", "London", "Tokyo", "Paris", "Sydney", 
       "Dubai", "Singapore", "Rome", "Barcelona", "Hong Kong"
   ];
   
   // Toggle weather container
   weatherButton.addEventListener('click', function() {
       weatherContainer.classList.toggle('active');
       
       if (weatherContainer.classList.contains('active')) {
           // Show random city weather on initial open
           const randomCity = cities[Math.floor(Math.random() * cities.length)];
           fetchWeather(randomCity);
           weatherSearchInput.value = randomCity;
       }
   });
   
   // Close weather container
   closeWeatherButton.addEventListener('click', function() {
       weatherContainer.classList.remove('active');
   });
   
   // Search for weather
   weatherSearchButton.addEventListener('click', function() {
       const city = weatherSearchInput.value.trim();
       if (city) {
           fetchWeather(city);
       }
   });
   
   // Allow pressing Enter to search
   weatherSearchInput.addEventListener('keypress', function(e) {
       if (e.key === 'Enter') {
           const city = weatherSearchInput.value.trim();
           if (city) {
               fetchWeather(city);
           }
       }
   });
   
   // Fetch weather data
   async function fetchWeather(city) {
       weatherContent.style.display = 'none';
       weatherMessage.style.display = 'none';
       weatherLoader.style.display = 'block';
       
       try {
           const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
           
           if (!response.ok) {
               throw new Error('City not found or API error');
           }
           
           const data = await response.json();
           displayWeather(data);
           weatherLoader.style.display = 'none';
           weatherContent.style.display = 'block';
       } catch (error) {
           weatherLoader.style.display = 'none';
           weatherMessage.textContent = error.message || 'Failed to fetch weather data';
           weatherMessage.style.display = 'block';
       }
   }
   
   // Display weather data
   function displayWeather(data) {
       const city = document.getElementById('weather-city');
       const temp = document.getElementById('weather-temp');
       const desc = document.getElementById('weather-desc');
       const humidity = document.getElementById('weather-humidity');
       const wind = document.getElementById('weather-wind');
       const icon = document.getElementById('weather-icon');
       
       city.textContent = `${data.location.name}, ${data.location.country}`;
       temp.textContent = `${data.current.temp_c}°C / ${data.current.temp_f}°F`;
       desc.textContent = data.current.condition.text;
       humidity.textContent = `${data.current.humidity}%`;
       wind.textContent = `${data.current.wind_kph} km/h`;
       icon.src = `https:${data.current.condition.icon}`;
   }
   
   // Textarea auto resize
   messageInput.addEventListener('input', function() {
       this.style.height = 'auto';
       this.style.height = (this.scrollHeight) + 'px';
       
       // Enable/disable send button based on input
       if (this.value.trim()) {
           sendButton.removeAttribute('disabled');
       } else {
           sendButton.setAttribute('disabled', true);
       }
   });
   
   document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = date => date.toISOString().split('T')[0];
    
    document.getElementById('checkIn').value = formatDate(today);
    document.getElementById('checkOut').value = formatDate(tomorrow);
    
    // Set min dates
    document.getElementById('checkIn').min = formatDate(today);
    document.getElementById('checkOut').min = formatDate(tomorrow);

    // Ensure check-out is always after check-in
    document.getElementById('checkIn').addEventListener('change', function() {
        const newCheckIn = new Date(this.value);
        const checkOut = document.getElementById('checkOut');
        const currentCheckOut = new Date(checkOut.value);
        
        if (newCheckIn >= currentCheckOut) {
            const newCheckOut = new Date(newCheckIn);
            newCheckOut.setDate(newCheckOut.getDate() + 1);
            checkOut.value = formatDate(newCheckOut);
        }
        
        checkOut.min = formatDate(new Date(newCheckIn.setDate(newCheckIn.getDate() + 1)));
    });
});

// Open/close hotel search panel
document.getElementById('hotelSearchBtn').addEventListener('click', function() {
    document.getElementById('hotelContainer').classList.add('active');
});

document.getElementById('closeHotelSearch').addEventListener('click', function() {
    document.getElementById('hotelContainer').classList.remove('active');
});

// Close when clicking outside the panel
document.getElementById('hotelContainer').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// Search hotels functionality
document.getElementById('searchHotelsBtn').addEventListener('click', function() {
    const destination = document.getElementById('destination').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    const rooms = document.getElementById('rooms').value;
    
    if (!destination) {
        alert('Please enter a destination');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('hotelResults').style.display = 'none';
    
    // API call using the provided API
    searchHotels(destination, checkIn, checkOut, guests, rooms);
});

function searchHotels(destination, checkIn, checkOut, guests, rooms) {
    const apiKey = '67c3d66f7d2c067e764000db';
    const apiUrl = 'https://api.makcorps.com/';
    
    fetch(`${apiUrl}hotels?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('hotelResults').style.display = 'block';
        
        // Display actual results
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('hotelResults').style.display = 'block';
        document.getElementById('hotelResults').innerHTML = '<p>An error occurred while searching for hotels. Please try again.</p>';
        
        // If API fails, fall back to sample data for demonstration
        displaySampleResults();
    });
}

function displayResults(data) {
    const resultsContainer = document.getElementById('hotelResults');
    resultsContainer.innerHTML = '';
    
    if (data.hotels && data.hotels.length > 0) {
        data.hotels.forEach(hotel => {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel_card67e7';
            
            hotelCard.innerHTML = `
                <div class="hotel_name64000">${hotel.name}</div>
                <div class="hotel_address67e7">${hotel.address}</div>
                <div class="hotel_price6f7d2">${hotel.price}</div>
            `;
            
            resultsContainer.appendChild(hotelCard);
        });
    } else {
        resultsContainer.innerHTML = '<p>No hotels found for your search criteria. Please try different dates or destination.</p>';
    }
}

function displaySampleResults() {
    const resultsContainer = document.getElementById('hotelResults');
    resultsContainer.innerHTML = '';
    
    // Sample hotel data
    const sampleHotels = [
        {
            name: 'Grand Plaza Hotel',
            address: '123 Main Street, City Center',
            price: '$189 per night'
        },
        {
            name: 'Seaside Resort & Spa',
            address: '456 Beach Road, Ocean View',
            price: '$249 per night'
        },
        {
            name: 'City Comfort Inn',
            address: '789 Urban Avenue, Downtown',
            price: '$129 per night'
        },
        {
            name: 'Mountain View Lodge',
            address: '101 Highland Road, Mountain District',
            price: '$159 per night'
        }
    ];
    
    // Create and append hotel cards
    sampleHotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.className = 'hotel_card67e7';
        
        hotelCard.innerHTML = `
            <div class="hotel_name64000">${hotel.name}</div>
            <div class="hotel_address67e7">${hotel.address}</div>
            <div class="hotel_price6f7d2">${hotel.price}</div>
        `;
        
        resultsContainer.appendChild(hotelCard);
    });
}
// Fixed format message function to handle all asterisks and formatting correctly
function formatMessage(text) {
    if (!text) return '';
    
    // Handle code blocks first (before other replacements)
    let formattedText = text.replace(/```([\s\S]*?)```/g, function(match, code) {
        return `<pre><code>${code}</code></pre>`;
    });

    // Handle inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle bold text (** in Markdown) - using non-greedy matching
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text (* in Markdown) - using non-greedy matching
    formattedText = formattedText.replace(/\*([^\*]*?)\*/g, '<em>$1</em>');
    
    // Handle bold text with underscore
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text with underscore
    formattedText = formattedText.replace(/_([^_]*?)_/g, '<em>$1</em>');
    
    // Replace newlines with <br> (after handling other markdown)
    formattedText = formattedText.replace(/\n/g, "<br>");
    
    // Handle bullet point lists - look for patterns at start of line or after <br>
    formattedText = formattedText.replace(/(^|<br>)[ \t]*[\*\-\•][ \t]+([^\n<]+)/gm, function(match, lineStart, content) {
        return `${lineStart}<span class="bullet-point">•</span> ${content}`;
    });
    
    // Handle numbered lists - look for patterns at start of line or after <br>
    formattedText = formattedText.replace(/(^|<br>)[ \t]*(\d+[\.\)])[ \t]+([^\n<]+)/gm, function(match, lineStart, number, content) {
        return `${lineStart}<span class="numbered-point">${number}</span> ${content}`;
    });
    
    // Add a simple check to convert URL-like text to actual links
    formattedText = formattedText.replace(
        /(https?:\/\/[^\s<]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return formattedText;
}

// CSS to add to your stylesheet for better formatting of messages
function addFormattingStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .message-text {
            line-height: 1.5;
            white-space: pre-wrap;
        }
        
        .message-text strong {
            font-weight: 700;
        }
        
        .message-text em {
            font-style: italic;
        }
        
        .message-text code {
            background-color: rgba(0,0,0,0.05);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        
        .message-text pre {
            background-color: rgba(0,0,0,0.05);
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .message-text pre code {
            background-color: transparent;
            padding: 0;
        }
        
        .message-text .bullet-point {
            display: inline-block;
            width: 18px;
            font-weight: bold;
            color: #0066cc;
        }
        
        .message-text .numbered-point {
            display: inline-block;
            min-width: 22px;
            font-weight: bold;
            color: #0066cc;
        }
        
        .message-text a {
            color: #0066cc;
            text-decoration: underline;
        }
        
        /* Add padding between list items for better readability */
        .message-text br + .bullet-point,
        .message-text br + .numbered-point {
            margin-top: 8px;
        }
    `;
    document.head.appendChild(styleElement);
}


const apiKey1 = '19728d68c9f57650bc3c8786';
        const baseUrl = 'https://v6.exchangerate-api.com/v6/';
        
        // DOM Elements
        const showAppButton = document.getElementById('showAppButton');
        const closeAppButton = document.getElementById('closeAppButton');
        const appContainer = document.getElementById('appContainer');
        const fromCurrencySelect = document.getElementById('fromCurrency');
        const toCurrencySelect = document.getElementById('toCurrency');
        const amountInput = document.getElementById('amount');
        const convertButton = document.getElementById('convertButton');
        const resultContainer = document.getElementById('resultContainer');
        const resultValue = document.getElementById('resultValue');
        const exchangeRateEl = document.getElementById('exchangeRate');
        const currenciesGrid = document.getElementById('currenciesGrid');
        const loadingEl = document.getElementById('loading');
        const errorMessageEl = document.getElementById('errorMessage');
        const lastUpdateEl = document.getElementById('lastUpdate');
        
        // Show app container when button is clicked
        showAppButton.addEventListener('click', function() {
            showAppButton.style.display = 'none';
            appContainer.style.display = 'block';
            fetchCurrencies();
        });
        
        // Close app container when close button is clicked
        closeAppButton.addEventListener('click', function() {
            appContainer.style.display = 'none';
            showAppButton.style.display = 'block';
        });
        
        // Initialize the application
        let exchangeRates = {};
        let currencies = {};
        
        // Fetch available currencies
        async function fetchCurrencies() {
            showLoading(true);
            hideError();
            
            try {
                const response = await fetch(`${baseUrl}${apiKey1}/latest/USD`);
                const data = await response.json();
                
                if (data.result === 'success') {
                    exchangeRates = data.conversion_rates;
                    currencies = Object.keys(exchangeRates).reduce((acc, code) => {
                        acc[code] = code;
                        return acc;
                    }, {});
                    
                    populateCurrencySelects();
                    updateCurrenciesGrid();
                    updateLastUpdate();
                    showLoading(false);
                } else {
                    throw new Error(data.error || 'Failed to fetch exchange rates');
                }
            } catch (error) {
                showError(`Error: ${error.message}`);
                showLoading(false);
            }
        }
        
        // Populate currency select dropdowns
        function populateCurrencySelects() {
            const currencyCodes = Object.keys(currencies).sort();
            
            fromCurrencySelect.innerHTML = '';
            toCurrencySelect.innerHTML = '';
            
            currencyCodes.forEach(code => {
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = `${code}`;
                
                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = `${code}`;
                
                fromCurrencySelect.appendChild(option1);
                toCurrencySelect.appendChild(option2);
            });
            
            // Set default values
            fromCurrencySelect.value = 'USD';
            toCurrencySelect.value = 'EUR';
        }
        
        // Update currencies grid with popular currencies
        function updateCurrenciesGrid() {
            const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
            const baseCurrency = 'USD';
            
            currenciesGrid.innerHTML = '';
            
            popularCurrencies.forEach(code => {
                if (code !== baseCurrency && exchangeRates[code]) {
                    const card = document.createElement('div');
                    card.className = 'c015';
                    
                    const codeEl = document.createElement('div');
                    codeEl.className = 'c016';
                    codeEl.textContent = code;
                    
                    const rateEl = document.createElement('div');
                    rateEl.className = 'c017';
                    rateEl.textContent = `${exchangeRates[code].toFixed(4)}`;
                    
                    card.appendChild(codeEl);
                    card.appendChild(rateEl);
                    currenciesGrid.appendChild(card);
                }
            });
        }
        
        // Convert currency
        convertButton.addEventListener('click', convertCurrency);
        
        async function convertCurrency() {
            const amount = parseFloat(amountInput.value);
            const fromCurrency = fromCurrencySelect.value;
            const toCurrency = toCurrencySelect.value;
            
            if (isNaN(amount) || amount <= 0) {
                showError('Please enter a valid amount');
                return;
            }
            
            showLoading(true);
            hideError();
            
            try {
                // Calculate conversion based on rates we already have
                const fromRate = exchangeRates[fromCurrency];
                const toRate = exchangeRates[toCurrency];
                
                if (fromRate && toRate) {
                    const conversionRate = toRate / fromRate;
                    const result = amount * conversionRate;
                    
                    // Display result
                    resultValue.textContent = `${result.toFixed(2)} ${toCurrency}`;
                    exchangeRateEl.textContent = `1 ${fromCurrency} = ${conversionRate.toFixed(6)} ${toCurrency}`;
                    resultContainer.style.display = 'block';
                    showLoading(false);
                } else {
                    throw new Error('Currency rates not available');
                }
            } catch (error) {
                showError(`Error: ${error.message}`);
                showLoading(false);
            }
        }
        
        // Helper functions
        function showLoading(show) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
        
        function showError(message) {
            errorMessageEl.textContent = message;
            errorMessageEl.style.display = 'block';
        }
        
        function hideError() {
            errorMessageEl.style.display = 'none';
        }
        
        function updateLastUpdate() {
            const now = new Date();
            lastUpdateEl.textContent = `Last updated: ${now.toLocaleString()}`;
        }