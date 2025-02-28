// Debounce function to limit excessive function calls
function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to extract email threads
function extractEmails() {
    console.log("Extracting emails...");

    let emails = document.querySelectorAll("div.adn"); // Email thread container
    let subject = document.querySelector("h2.hP"); // Subject line
    let emailData = {};

    if (!emails.length) {
        console.warn("No emails found.");
        return;
    }

    emails.forEach((email, index) => {
        let senderNode = email.querySelector(".gD");
        let sender = senderNode ? senderNode.innerText : "Unknown Sender";

        let bodyNode = email.querySelector("div.a3s"); // Email body
        let bodyText = bodyNode ? bodyNode.innerText.trim() : "[No body content]";

        let timeNode = email.querySelector(".gH .gK"); // Email time
        let emailTime = timeNode ? timeNode.innerText : "Unknown Time";

        emailData[index] = {
            subject: subject ? subject.innerText : "No Subject",
            sender: sender,
            time: emailTime,
            body: bodyText,
        };
    });

    console.log("Extracted Email Data:", emailData);
    chrome.storage.local.set({ emailThread: emailData });
}

// Debounced version of extractEmails
const debouncedExtractEmails = debounce(extractEmails, 1000);

// Run the function when Gmail loads
window.addEventListener("load", () => {
    console.log("Gmail Email Reader Loaded");
    setTimeout(extractEmails, 3000); // Give Gmail time to render
});

// Use MutationObserver to detect changes in the email thread container
const observer = new MutationObserver(debouncedExtractEmails);

function startObserving() {
    let checkContainer = setInterval(() => {
        let emailContainer = document.querySelector("div.aeF");
        if (emailContainer) {
            console.log("Email container found, starting observer...");
            observer.observe(emailContainer, { childList: true, subtree: true });
            clearInterval(checkContainer);
        }
    }, 1000);
}

// Start observing with an interval to ensure the container exists
setTimeout(startObserving, 5000);
