const express = require('express');
const Projects = require('../data/helpers/projectModel');
const Actions = require('../data/helpers/actionModel');

const router = express.Router();

router.get('/', (req, res, next) => {
  Projects.get().then(projects => {
    let projectsPostsPromises = projects.map(project => Projects.getProjectActions(project.id));
    Promise.all(projectsPostsPromises).then(projectsPostsLists => {
      const projectsWithPosts = projects.map((project, i) => ({ ...project, actions: projectsPostsLists[i] }));
      res.status(200).json(projectsWithPosts);
    }).catch(next);
  }).catch(next);
});

router.get('/:id', validateProjectId, (req, res) => {
  res.status(200).json(req.project);
});

router.get('/:id/actions', validateProjectId, (req, res, next) => {
  Projects.getProjectActions(req.project.id).then(actions => {
    res.status(200).json(actions);
  }).catch(next);
});

router.post('/', validateProjectsBody, (req, res, next) => {
  const { name, description, completed } = req.body;
  Projects.insert({ name, description, completed }).then(project => {
    res.status(201).json(project);
  }).catch(next);
});

router.post('/:id/actions', validateProjectId, validateActionsBody, (req, res, next) => {
  const { description, notes, completed } = req.body;
  Actions.insert({
    project_id: req.project.id,
    description,
    notes,
    completed
  }).then(action => {
    res.status(201).json(action);
  }).catch(next);
});

router.put('/:id', validateProjectId, validateProjectsAtLeastOneBody, (req, res, next) => {
  const { name, description, completed } = req.body;
  Projects.update(req.project.id, { name, description, completed }).then(project => {
    res.status(200).json(project);
  }).catch(next);
});

router.delete('/:id', validateProjectId, (req, res, next) => {
  Projects.remove(req.project.id).then(() => {
    res.status(200).json(req.project);
  }).catch(next);
});

function validateProjectsBody(req, res, next) {
  const { name, description } = req.body;
  if (!name || !description) {
    res.status(400).json({ message: "Please provide the required name and description fields!" });
  }
  next();
}

function validateActionsBody(req, res, next) {
  const { description, notes } = req.body;
  if (!description || !notes) {
    res.status(400).json({ message: "Please provide the required description and notes fields!" });
  }
  if (description.length > 128) {
    res.status(400).json({ message: "Description is too long!" });
  }
  next();
}

function validateProjectsAtLeastOneBody(req, res, next) {
  const { name, description, completed } = req.body;
  if (!name && !description && typeof completed === 'undefined') {
    res.status(400).json({ message: "Please provide one of these fields to change: name, description or completed." });
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