// Form Handling with Terminal Feedback
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const subjectEl = document.getElementById("subject");
    const bodyEl = document.getElementById("body");

    if (!emailEl || !subjectEl || !bodyEl) {
      console.error("CRITICAL_ERROR: Missing required form elements");
      return;
    }

    const email = emailEl.value;
    const subject = subjectEl.value;
    const body = bodyEl.value;

    if (!email || !subject || !body) {
      alert("ERROR: All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("ERROR: Invalid protocol in email address");
      return;
    }

    // Simulated Terminal Output
    console.log("INITIATING_CONNECTION...");
    console.log(`HEADER: ${subject}`);
    console.log("ENCRYPTING_PAYLOAD...");
    console.log("TRANSMISSION_SUCCESSFUL");

    alert(">>> MSG_SENT: Connection established. (Demo mode active)");

    contactForm.reset();
  });
}
