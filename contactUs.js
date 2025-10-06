function sendMail() {
    console.log("Submit button clicked");

    var params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        title: document.getElementById("title").value,
        type: document.getElementById("type").value, // gets the selected value (e.g., "technical")
        message: document.getElementById("message").value,
    };

    emailjs.send('service_9q42d6c', 'template_dpeg8nd', params).then(alert("Message sent successfully!"));
}
