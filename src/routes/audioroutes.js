const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../../db/mysql');
const { decryptAudio } = require('../services/audioservice');

const upload = multer({ dest: 'uploads/tmp/' });

// Route pour afficher tous les messages
router.get('/messages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, filename, created_at FROM messages ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer un message
router.delete('/delete-message/:id', async (req, res) => {
  const messageId = req.params.id;

  try {
    const [rows] = await db.query('SELECT filename FROM messages WHERE id = ?', [messageId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Message non trouvé' });

    const filePath = path.join(__dirname, '../../uploads/encrypted', rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM messages WHERE id = ?', [messageId]);

    res.json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour uploader un fichier audio
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
    try {
      const userId = req.body.userId;
      const originalPath = req.file.path;
      const originalName = req.file.originalname;
  
      const AES_KEY = crypto.randomBytes(32); // 256 bits
      const AES_IV = crypto.randomBytes(16);  // 128 bits
  
      const encryptedFileName = `${Date.now()}_${originalName}.enc`;
      const encryptedPath = path.join(__dirname, '../../uploads/encrypted', encryptedFileName);
      const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, AES_IV);
  
      const input = fs.createReadStream(originalPath);
      const output = fs.createWriteStream(encryptedPath);
  
      const stream = input.pipe(cipher).pipe(output);
  
      stream.on('finish', async () => {
        const encryptedData = fs.readFileSync(encryptedPath);
        const hash = crypto.createHash('sha256').update(encryptedData).digest('hex');
  
        const [result] = await db.query(
          'INSERT INTO messages (user_id, filename, encrypted_data, sha256_hash, aes_key, aes_iv) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, encryptedFileName, encryptedData, hash, AES_KEY.toString('hex'), AES_IV.toString('hex')]
        );
  
        fs.unlinkSync(originalPath);
        res.json({ message: 'Fichier chiffré et enregistré avec succès', id: result.insertId, key: AES_KEY.toString('hex') });
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur BDD' });
    }
  });
  

// Route pour déchiffrer et récupérer un fichier audio
router.get('/get-audio/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    const decryptKey = req.query.key;
    console.log(`Message ID: ${messageId}, Decrypt Key from query: ${decryptKey}`);

    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
    
    if (rows.length === 0) {
      console.error('Message non trouvé');
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const message = rows[0];

    console.log('Données récupérées de la base :');
    console.log(' - Fichier :', message.filename);
    console.log(' - AES Key (BDD) :', message.aes_key);
    console.log(' - AES IV (BDD) :', message.aes_iv);

    const encryptedFilePath = path.join(__dirname, '../../uploads/encrypted', message.filename);
    console.log(`Encrypted File Path: ${encryptedFilePath}`);

    if (!fs.existsSync(encryptedFilePath)) {
      console.error('Fichier chiffré non trouvé');
      return res.status(404).json({ message: 'Fichier chiffré non trouvé' });
    }

    const decryptedFilePath = decryptAudio(encryptedFilePath, message.aes_key, message.aes_iv);
    console.log(`Decrypted File Path: ${decryptedFilePath}`);

    res.sendFile(decryptedFilePath);
  } catch (err) {
    console.error('Erreur lors de la récupération du fichier audio:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération du fichier audio' });
  }
});

module.exports = router;
