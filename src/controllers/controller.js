const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../../db/mysql');

// AES key
const key = crypto.randomBytes(32); // 🔒 256 bits

exports.uploadMessage = async (req, res) => {
    try {
        const { userId, audioBase64 } = req.body;

        const audioBuffer = Buffer.from(audioBase64, 'base64');

        // Chiffrement AES
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(audioBuffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        const sha256 = crypto.createHash('sha256').update(audioBuffer).digest('hex');

        const filename = `msg_${Date.now()}.bin`;

        await db.execute(
            `INSERT INTO messages (user_id, filename, encrypted_data, sha256_hash) VALUES (?, ?, ?, ?)`,
            [userId, filename, encrypted, sha256]
        );

        res.json({ message: 'Message enregistré avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getMessages = async (req, res) => {
    const [rows] = await db.execute(`SELECT * FROM messages`);
    res.json(rows);
};
