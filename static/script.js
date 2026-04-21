// 🎤 ELEMENTS
const btn = document.getElementById("micBtn");
const status = document.getElementById("status");
const textBtn = document.getElementById("textBtn");
const textInput = document.getElementById("textInput");
const glow = document.getElementById("mouseGlow");

// 🎤 SPEECH RECOGNITION SAFE SETUP
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

if (!SpeechRecognition) {
    alert("Your browser does not support voice recognition. Please use Google Chrome.");
} else {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
}

// 🎤 MIC BUTTON
btn.onclick = () => {
    if (!recognition) return;

    if (!isListening) {
        try {
            recognition.start();
            status.innerText = "Listening...";
            isListening = true;
            btn.innerText = "🛑 Stop";
        } catch (e) {
            console.log("Recognition already started");
        }
    } else {
        recognition.stop();
        status.innerText = "Stopped";
        isListening = false;
        btn.innerText = "🎙️ Start Talking";
    }
};

// 🎤 RESULT
if (recognition) {
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        recognition.stop();
        analyzeText(text);
    };

    recognition.onend = () => {
        isListening = false;
        btn.innerText = "🎙️ Start Talking";
    };

    recognition.onerror = (e) => {
        status.innerText = "Mic error: " + e.error;
        isListening = false;
        btn.innerText = "🎙️ Start Talking";
    };
}

// ✍️ TEXT INPUT
textBtn.onclick = () => {
    const text = textInput.value.trim();
    if (!text) return alert("Enter text");
    analyzeText(text);
};

textInput.addEventListener("keypress", e => {
    if (e.key === "Enter") textBtn.click();
});

// 🔥 API CALL
async function analyzeText(text) {
    status.innerText = "Processing...";

    try {
        const res = await fetch("/analyze-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        document.getElementById("text").innerText = text;
        document.getElementById("main").innerText =
            (data.emotion || "unknown") + " (" + (data.sentiment || "unknown") + ")";
        document.getElementById("message").innerText = data.message;

        status.innerText = "Done ✅";
    } catch (error) {
        console.error(error);
        status.innerText = "Error ❌";
    }
}

// 🖱️ MOUSE GLOW
document.addEventListener("mousemove", e => {
    if (!glow) return;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// ✨ SCROLL ANIMATION
function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();