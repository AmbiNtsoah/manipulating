
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// 🔽 Sert les fichiers frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'src/public')));

// 🔽 Route principale qui envoie l'index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/public', 'enregistrement.html'));
});

// 🔽 Tes routes API
const audioRoutes = require('../backend/src/routes/audioroutes')
app.use('/', audioRoutes);

app.listen(3000, () => {
  console.log('Backend running at http://localhost:3000');
});
