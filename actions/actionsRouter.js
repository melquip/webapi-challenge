const express = require('express');
const Actions = require('../data/helpers/actionModel');

const router = express.Router();

router.get('/', (req, res, next) => {
  Actions.get().then(actions => {
    res.status(200).json(actions);
  }).catch(next);
});

router.use((error, req, res, next) => {
  res.status(500).json({
    file: 'actionsRouter',
    method: req.method,
    url: req.url,
    message: error.message
  });
});

module.exports = router;