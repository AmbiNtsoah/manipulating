let mediaRecorder;
let audioChunks = [];
let lastRecordingId = null;

let isRecording = false;
let timerInterval;
let seconds = 0;

function formatTime(s) {
  const mins = String(Math.floor(s / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function startTimer() {
  seconds = 0;
  document.getElementById('timer').textContent = formatTime(seconds);
  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById('timer').textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

document.getElementById("startBtn").onclick = async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stopTimer();
        document.getElementById("startBtn").classList.remove("animate-pulse", "bg-green-600");
        document.getElementById("startBtn").classList.add("bg-red-500");

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('userId', 1); // à adapter

        const response = await fetch('http://localhost:3000/upload-audio', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (response.ok) {
          alert("Enregistrement envoyé !");
          lastRecordingId = result.id;
          console.log("Clé de déchiffrement:", result.key);
          document.getElementById("playBtn").disabled = false;
        } else {
          alert("Erreur lors de l'envoi de l'enregistrement");
        }
      };

      mediaRecorder.start();
      isRecording = true;
      startTimer();

      document.getElementById("startBtn").classList.remove("bg-red-500");
      document.getElementById("startBtn").classList.add("bg-green-600", "animate-pulse");

    } catch (err) {
      console.error('Erreur microphone:', err);
      alert('Impossible d’accéder au microphone.');
    }

  } else {
    mediaRecorder.stop();
    isRecording = false;
  }
};

document.getElementById("playBtn").onclick = async () => {
  const decryptKey = document.getElementById("decryptKey").value;
  if (lastRecordingId && decryptKey) {
    const audioPlayer = document.getElementById("audioPlayer");
    const response = await fetch(`http://localhost:3000/get-audio/${lastRecordingId}?key=${decryptKey}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      audioPlayer.play();
    } else {
      alert("Erreur lors de la récupération de l'enregistrement");
    }
  } else {
    alert("Veuillez entrer la clé de déchiffrement");
  }
};
document.getElementById("avatarBtn").addEventListener("click", () => {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("hidden");
});

// Cacher le menu si on clique ailleurs
document.addEventListener("click", (e) => {
  const menu = document.getElementById("dropdownMenu");
  const button = document.getElementById("avatarBtn");

  if (!menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

// Fonction de déconnexion
function logout() {
  // log out logic here
  alert("Déconnexion...");
  // Par exemple : window.location.href = 'login.html';
}
