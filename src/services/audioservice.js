const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function decryptAudio(filePath, keyHex, ivHex) {
  try {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    const encryptedData = fs.readFileSync(filePath);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    const decryptedDir = path.join(__dirname, '../../uploads/decrypted');
    if (!fs.existsSync(decryptedDir)) {
      fs.mkdirSync(decryptedDir, { recursive: true });
    }

    const decryptedFilePath = path.join(decryptedDir, path.basename(filePath).replace(/\.enc$/, ''));
    fs.writeFileSync(decryptedFilePath, decrypted);

    return decryptedFilePath;
  } catch (err) {
    console.error('Erreur lors du déchiffrement:', err);
    throw err;
  }
}

module.exports = {
  decryptAudio
};
