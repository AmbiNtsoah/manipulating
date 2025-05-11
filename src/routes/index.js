const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.post('/upload', controller.uploadMessage);
router.get('/messages', controller.getMessages);

module.exports = router;
