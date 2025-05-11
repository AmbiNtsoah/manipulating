let mediaRecorder;
let audioChunks = [];
let lastRecordingId = null;

let isRecording = false;
let timerInterval;
let seconds = 0;

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


document.addEventListener('DOMContentLoaded', () => {
  fetch('/messages')
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des messages");
      }
      return response.json();
    })
    .then(data => {
      const tableBody = document.getElementById('messages-table-body');
      tableBody.innerHTML = '';

      data.forEach(message => {
        const row = document.createElement('tr');

        // ID
        const idCell = document.createElement('td');
        idCell.textContent = message.id;
        row.appendChild(idCell);

        // Nom du fichier
        const filenameCell = document.createElement('td');
        filenameCell.textContent = message.filename;
        row.appendChild(filenameCell);

        // Date
        const dateCell = document.createElement('td');
        const date = new Date(message.created_at);
        dateCell.textContent = date.toLocaleString();  // format lisible
        row.appendChild(dateCell);

        // Actions (Lire et Supprimer)
        const actionCell = document.createElement('td');

        const playButton = document.createElement('button');
        playButton.textContent = 'Lire';
        playButton.className = 'read-btn';

        // Afficher le modal au clic du bouton
        playButton.onclick = () => {
        const messageId = message.id; // Récupérer l'ID du message

        // Créer l'URL du fichier audio
        const audioUrl = `/get-audio/${messageId}`;

        // Récupérer le modal et le lecteur audio
        const modal = document.getElementById('audioModal');
        const audioPlayer = document.getElementById('audioPlayer');
        
        // Mettre à jour la source du lecteur audio et jouer
        audioPlayer.src = audioUrl;
        audioPlayer.play();

        // Afficher le modal
        modal.classList.remove('hidden');

         // Fermer le modal lorsqu'on clique sur l'icône de fermeture
        document.getElementById('closeModal').onclick = () => {
        modal.classList.add('hidden'); // Masquer le modal
        audioPlayer.pause(); // Pause l'audio quand on ferme le modal
        audioPlayer.currentTime = 0; // Remet l'audio au début pour la prochaine lecture
        };
        };

        actionCell.appendChild(playButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => {
        if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
            fetch(`/delete-message/${message.id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(() => location.reload())
            .catch(err => alert('Erreur lors de la suppression'));
        }
        };
        actionCell.appendChild(deleteButton);

                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
    })
    .catch(err => {
      console.error("Erreur lors du chargement des messages :", err);
    });
});

