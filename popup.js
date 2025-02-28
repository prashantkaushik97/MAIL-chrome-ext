document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded. Fetching stored emails...");
  
    chrome.storage.local.get("emailThread", (data) => {
      let emailContainer = document.getElementById("emailContainer");
  
      if (!data.emailThread || Object.keys(data.emailThread).length === 0) {
        emailContainer.innerHTML = "<p>No emails found. Open a thread in Gmail.</p>";
        return;
      }
  
      emailContainer.innerHTML = "";
      Object.keys(data.emailThread).forEach(key => {
        let email = data.emailThread[key];
        let emailElement = document.createElement("div");
        emailElement.innerHTML = `<p><strong>Subject:</strong> ${email.subject}</p><p><strong>Body:</strong> ${email.body}</p><hr>`;
        emailContainer.appendChild(emailElement);
      });
  
      console.log("Displayed emails:", data.emailThread);
    });
  });
  