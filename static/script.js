const btn = document.getElementById("micBtn");
const status = document.getElementById("status");
const textBtn = document.getElementById("textBtn");
const textInput = document.getElementById("textInput");
const glow = document.getElementById("mouseGlow");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

let isListening = false;

// 🎤 MIC
btn.onclick = () => {
    if (!isListening) {
        recognition.start();
        status.innerText = "Listening...";
        isListening = true;
        btn.innerText = "🛑 Stop";
    } else {
        recognition.stop();
        status.innerText = "Stopped";
        isListening = false;
        btn.innerText = "🎙️ Start Talking";
    }
};

recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    recognition.stop();
    analyzeText(text);
};

recognition.onend = () => {
    isListening = false;
    btn.innerText = "🎙️ Start Talking";
};

// ✍️ TEXT
textBtn.onclick = () => {
    const text = textInput.value;
    if (!text) return alert("Enter text");
    analyzeText(text);
};

textInput.addEventListener("keypress", e => {
    if (e.key === "Enter") textBtn.click();
});

// 🔥 API
async function analyzeText(text) {
    status.innerText = "Processing...";

    const res = await fetch("/analyze-text", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ text })
    });

    const data = await res.json();

    document.getElementById("text").innerText = text;
    document.getElementById("main").innerText =
        (data.emotion || "unknown") + " (" + (data.sentiment || "unknown") + ")";
    document.getElementById("message").innerText = data.message;

    status.innerText = "Done ✅";
}

// 🖱️ MOUSE GLOW
document.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// ✨ SCROLL
function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
}
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();