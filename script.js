const boycottList = [
  "coca cola", "pepsi", "starbucks", "mcdonalds", "nestle", "puma", "zara", "nike", "kfc", "dominos",
  "pizza hut", "burger king", "colgate", "pantene", "head and shoulders", "revlon", "loreal", "dove",
  "vaseline", "gillette", "rexona", "maggi", "lays", "pringles", "snickers", "kitkat", "tropicana",
  "mountain dew", "fanta", "sprite", "7up", "aqua fina", "nivea", "dettol"
];

const startBtn = document.getElementById("start-btn");
const statusText = document.getElementById("status");
const alertBox = document.getElementById("alert-box");
const alertSound = document.getElementById("alert-sound");

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-US";

startBtn.onclick = () => {
  recognition.start();
  statusText.textContent = "Status: Listening...";
};

recognition.onresult = event => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
  console.log("Heard:", transcript);
  for (let keyword of boycottList) {
    if (transcript.includes(keyword)) {
      alertBox.style.display = "block";
      alertSound.play();
      if (navigator.vibrate) navigator.vibrate(500);
      setTimeout(() => alertBox.style.display = "none", 3000);
      break;
    }
  }
};

recognition.onerror = event => {
  statusText.textContent = "Error: " + event.error;
};
