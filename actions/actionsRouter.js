const express = require('express');
const Actions = require('../data/helpers/actionModel');

const router = express.Router();

router.get('/', (req, res, next) => {
  Actions.get().then(actions => {
    res.status(200).json(actions);
  }).catch(next);
});

router.put('/:id', validateActionId, validateActionsAtLeastOneBody, (req, res, next) => {
  const { description, notes, completed } = req.body;
  Actions.update(req.action.id, { description, notes, completed }).then(action => {
    res.status(200).json(action);
  }).catch(next);
});

router.delete('/:id', validateActionId, (req, res, next) => {
  Actions.remove(req.action.id).then(deleted => {
    res.status(200).json(req.action);
  }).catch(next);
});

function validateActionsAtLeastOneBody(req, res, next) {
  const { description, notes, completed } = req.body;
  if (!description && !notes && typeof completed === 'undefined') {
    res.status(400).json({ message: "Please provide the necessary name, description and completed fields!" });
  }
  next();
}

function validateActionId(req, res, next) {
  const { id } = req.params;
  if (!id || parseInt(id) < 1) {
    res.status(400).json({ message: "Invalid action id!" });
  }
  Actions.get(id).then(action => {
    if (action) {
      req.action = action;
      next();
    } else {
      res.status(404).json({ message: "Could not get action with that id!" });
    }
  }).catch(next);
}

router.use((error, req, res, next) => {
  res.status(500).json({
    file: 'actionsRouter',
    method: req.method,
    url: req.url,
    message: error.message
  });
});

module.exports = router;