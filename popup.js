document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded. Fetching stored emails...");

    let emailContainer = document.getElementById("emailContainer");
    let toggleButton = document.getElementById("toggleEmails");
    let replyButton = document.getElementById("generateReply");
    let replyContainer = document.getElementById("replyContainer");

    let emailThread = [];

    // Toggle email details visibility
    toggleButton.addEventListener("click", () => {
        emailContainer.classList.toggle("hidden");
        toggleButton.textContent = emailContainer.classList.contains("hidden") ? "📩 Show Emails" : "📩 Hide Emails";
    });

    // Fetch and display emails
    chrome.storage.local.get("emailThread", (data) => {
        if (!data.emailThread || Object.keys(data.emailThread).length === 0) {
            emailContainer.innerHTML = "<p>No emails found. Open a thread in Gmail.</p>";
            return;
        }

        emailContainer.innerHTML = "";
        emailThread = Object.values(data.emailThread); // Convert object to array

        emailThread.forEach((email, index) => {
            let emailElement = document.createElement("div");
            emailElement.innerHTML = `
                <p><strong>From:</strong> ${email.sender}</p>
                <p><strong>Subject:</strong> ${email.subject}</p>
                <p><strong>Time:</strong> ${email.time}</p>
                <p><strong>Body:</strong> ${email.body}</p>
                <hr>
            `;
            emailContainer.appendChild(emailElement);
        });

        console.log("Displayed emails:", emailThread);
    });

    // Generate reply using API
    replyButton.addEventListener("click", async () => {
        if (emailThread.length === 0) {
            replyContainer.innerHTML = `<p><em>No emails to generate a reply for.</em></p>`;
            return;
        }

        replyContainer.innerHTML = `<p><em>Generating reply...</em></p>`;

        // Extract the latest email to respond to
        let latestEmail = emailThread[emailThread.length - 1];
        let previousEmails = emailThread.slice(0, -1); // Context emails

        let requestBody = {
            input_email: {
                sender: latestEmail.sender,
                subject: latestEmail.subject,
                time: latestEmail.time,
                emailbody: latestEmail.body
            },
            email_context: previousEmails.map(email => ({
                sender: email.sender,
                subject: email.subject,
                time: email.time,
                body: email.body
            })),
            tone: "friendly",
            length: "short",
            guidelines: ""
        };

        try {
            let response = await fetch("http://127.0.0.1:5000/generate_email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            let responseData = await response.json();
            if (response.ok) {
                replyContainer.innerHTML = `<p><strong>Generated Reply:</strong> ${responseData.response}</p>`;
            } else {
                replyContainer.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${responseData.error || "Failed to generate reply."}</p>`;
            }
        } catch (error) {
            console.error("API request failed:", error);
            replyContainer.innerHTML = `<p style="color: red;"><strong>Error:</strong> Unable to connect to the server.</p>`;
        }
    });
});
