// Function to extract email thread
function extractEmails() {
  console.log("Extracting emails...");

  let emails = document.querySelectorAll("div.adn"); // Email thread container
  let subject = document.querySelector("h2.hP"); // Subject line
  let emailData = {};
  console.log("EMAILSSSS")
  console.log(emails)
  console.log(subject)

  if (!emails.length) {
    console.log("No emails found.");
    return;
  }

  emails.forEach((email, index) => {
    let body = email.querySelector("div.a3s"); // Email body (excluding attachments)
    
    if (body && !email.querySelector(".aQH")) { // Ignore documents/attachments
      emailData[index] = {
        subject: subject ? subject.innerText : "No Subject",
        body: body.innerText.trim()
      };
    }
  });

  let sortedEmailData = Object.keys(emailData)
    .sort((a, b) => a - b)
    .reduce((acc, key) => {
      acc[key] = emailData[key];
      return acc;
    }, {});

  console.log("Extracted Email Data:", sortedEmailData);
  chrome.storage.local.set({ emailThread: sortedEmailData });
}

// Run the function when Gmail loads
window.addEventListener("load", () => {
  console.log("Gmail Email Reader Loaded");
  setTimeout(extractEmails, 3000); // Give Gmail some time to render
});

// Run the function when user clicks inside Gmail
document.addEventListener("click", () => {
  setTimeout(extractEmails, 1000);
});
