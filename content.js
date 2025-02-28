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
    let subject = document.querySelector("h2.hP") || document.querySelector('[data-legacy-thread-id]'); // Subject line
    let emailData = {};

    if (!emails.length) {
        console.warn("No emails found.");
        return;
    }

    emails.forEach((email, index) => {
        try {
            let senderNode = email.querySelector(".gD");
            let sender = senderNode ? senderNode.innerText : "Unknown Sender";

            let bodyNode = email.querySelector("div.a3s"); // Email body
            let bodyText = bodyNode?.innerText.trim() || "[No body content]";

            let timeNode = email.querySelector(".gH .gK"); // Email time
            let emailTime = timeNode?.innerText || "Unknown Time";

            emailData[index] = {
                subject: subject?.innerText || "No Subject",
                sender: sender,
                time: emailTime,
                body: bodyText,
            };
        } catch (err) {
            console.error(`Error processing email at index ${index}:`, err);
        }
    });

    console.log("Extracted Email Data:", emailData);

    // Save extracted emails without overwriting existing data
    chrome.storage.local.get("emailThread", (data) => {
        let existingData = data.emailThread || {};
        let updatedData = { ...existingData, ...emailData };
        chrome.storage.local.set({ emailThread: updatedData });
    });
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

function waitForEmailContainer(callback) {
    let attempts = 0;
    let maxAttempts = 10;
    let interval = setInterval(() => {
        let emailContainer = document.querySelector("div.aeF");
        if (emailContainer || attempts >= maxAttempts) {
            clearInterval(interval);
            if (emailContainer) {
                console.log("Email container found, starting observer...");
                observer.observe(emailContainer, { childList: true, subtree: true });
            } else {
                console.warn("Email container not found after multiple attempts.");
            }
        }
        attempts++;
    }, 1000);
}

// Start observing when the email container is available
setTimeout(() => waitForEmailContainer(() => {}), 5000);
