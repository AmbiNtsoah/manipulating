const connection = require('../../db/mysql');
const fs = require('fs');
const path = require('path');
const { encryptAudio, decryptAudio } = require('../services/audioservice');

async function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [results] = await connection.query(query, [userId]);
  return results;
}

async function saveAudioRecord(userId, filePath) {
  const query = 'INSERT INTO audio_records (user_id, file_path) VALUES (?, ?)';
  const [results] = await connection.query(query, [userId, filePath]);
  return results;
}

module.exports = {
  getUserById,
  saveAudioRecord
};
