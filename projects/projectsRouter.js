const express = require('express');
const Projects = require('../data/helpers/projectModel');

const router = express.Router();

router.get('/', (req, res, next) => {
  Projects.get().then(projects => {
    res.status(200).json(projects);
  }).catch(next);
});

router.post('/', validateProjectsBody, (req, res, next) => {
  const { name, description, completed } = req.body;
  Projects.insert({ name, description, completed }).then(project => {
    res.status(201).json(project);
  }).catch(next);
});

router.put('/:id', validateProjectId, validateProjectsAtLeastOneBody, (req, res, next) => {
  const { name, description, completed } = req.body;
  Projects.update(req.project.id, { name, description, completed }).then(project => {
    res.status(200).json(project);
  }).catch(next);
});

router.delete('/:id', validateProjectId, (req, res, next) => {
  Projects.remove(req.project.id).then(deleted => {
    res.status(200).json(req.project);
  }).catch(next);
});

function validateProjectsBody(req, res, next) {
  const { name, description, completed } = req.body;
  if (!name || !description || typeof completed === 'undefined') {
    res.status(400).json({ message: "Please provide the necessary name, description and completed fields!" });
  }
  next();
}

function validateProjectsAtLeastOneBody(req, res, next) {
  const { name, description, completed } = req.body;
  if (!name && !description && typeof completed === 'undefined') {
    res.status(400).json({ message: "Please provide the necessary name, description and completed fields!" });
  }
  next();
}

function validateProjectId(req, res, next) {
  const { id } = req.params;
  if (!id || parseInt(id) < 1) {
    res.status(400).json({ message: "Invalid project id!" });
  }
  Projects.get(id).then(project => {
    if (project) {
      req.project = project;
      next();
    } else {
      res.status(404).json({ message: "Could not get project with that id!" });
    }
  }).catch(next);
}

router.use((error, req, res, next) => {
  res.status(500).json({
    file: 'projectsRouter',
    method: req.method,
    url: req.url,
    message: error.message
  });
});

module.exports = router;