import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialProjectFormState = {
  name: "",
  description: "",
  completed: false
}

const initialActionFormState = {
  description: "",
  notes: "",
  completed: false
}

const initialIsEditingAction = { project_id: 0, id: 0 };

function App() {
  const baseUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API : '';

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(initialProjectFormState);
  const [isEditingProject, setEditingProject] = useState(0);

  const [actionForm, setActionForm] = useState(initialActionFormState);
  const [isEditingAction, setEditingAction] = useState(initialIsEditingAction);

  useEffect(() => {
    axios.get(baseUrl + '/api/projects').then(response => {
      console.log(response.data);
      setProjects(response.data);
    }).catch(err => console.log(err));
  }, []);

  const onProjectInputChange = e => {
    const { name, type, value } = e.target;
    setProjectForm({ ...projectForm, [name]: type === "checkbox" ? !projectForm.completed : value });
  }

  const onActionInputChange = e => {
    const { name, type, value } = e.target;
    setActionForm({ ...actionForm, [name]: type === "checkbox" ? !actionForm.completed : value });
  }

  const onProjectSubmit = e => {
    e.preventDefault();
    if (isEditingProject === 0) {
      axios.post(baseUrl + '/api/projects', projectForm).then(response => {
        setProjects([...projects, response.data]);
      }).catch(err => console.log(err));
    } else {
      axios.put(baseUrl + '/api/projects/' + isEditingProject, projectForm).then(response => {
        setProjects(projects.map(project => {
          if (Number(project.id) === isEditingProject) return response.data;
          return project;
        }));
      }).catch(err => console.log(err));
    }
    setProjectForm(initialProjectFormState);
    setEditingProject(0);
  }

  const onActionSubmit = e => {
    e.preventDefault();
    if (isEditingAction.id === 0 && isEditingProject !== 0) {
      axios.post(baseUrl + '/api/projects/' + isEditingProject + '/actions', actionForm).then(response => {
        const action = response.data;
        setProjects(projects.map(project => {
          if (Number(project.id) === Number(action.project_id)) {
            return {
              ...project,
              actions: project.actions.concat(action)
            }
          } else return project;
        }));
      }).catch(err => console.log(err));
    } else if(isEditingAction.id !== 0) {
      axios.put(baseUrl + '/api/actions/' + isEditingAction.id, actionForm).then(response => {
        const action = response.data;
        setProjects(projects.map(project => {
          if (Number(project.id) === Number(action.project_id)) {
            return {
              ...project,
              actions: project.actions.map(actionM => {
                if (Number(actionM.id) === action.id) {
                  return action;
                }
                return actionM;
              })
            }
          } else return project;
        }));
      }).catch(err => console.log(err));
    }
    setActionForm(initialActionFormState);
    setEditingAction(initialIsEditingAction);
  }

  const editProject = id => e => {
    setEditingProject(id);
    setProjectForm(projects.find(project => Number(project.id) === Number(id)))
  }

  const editAction = (project_id, id) => e => {
    setEditingAction({ project_id: Number(project_id), id: Number(id) });
    const project = projects.find(project => Number(project.id) === Number(project_id));
    const action = project.actions.find(action => Number(action.id) === Number(id));
    setActionForm(action);
  }

  const removeProject = id => e => {
    axios.delete(baseUrl + '/api/projects/' + id).then(response => {
      setProjects(projects.filter(project => Number(project.id) !== Number(response.data.id)));
    }).catch(err => console.log(err));
  }

  const removeAction = id => e => {
    axios.delete(baseUrl + '/api/actions/' + id).then(response => {
      const action = response.data;
      setProjects(projects.map(project => {
        if (Number(project.id) === Number(action.project_id)) {
          return {
            ...project,
            actions: project.actions.filter(actionF => Number(actionF.id) !== Number(action.id))
          }
        } else return project;
      }));
    }).catch(err => console.log(err));
  }

  return (
    <div className="App">
      <div className="flex">
        <div className="col col2">
          <h2>Projects form</h2>
          <form onSubmit={onProjectSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Project name here"
              required
              value={projectForm.name}
              onChange={onProjectInputChange}
            />
            <label htmlFor="description">Description:</label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Project description here"
              required
              value={projectForm.description}
              onChange={onProjectInputChange}
            />
            <label htmlFor="completed">Completed:</label>
            <input
              id="completed"
              type="checkbox"
              name="completed"
              checked={projectForm.completed ? 'checked' : ''}
              onChange={onProjectInputChange}
            />
            <button className="submitProject">Submit</button>
          </form>
        </div>
        <div className="col col2">
          <h2>Actions form</h2>
          <form onSubmit={onActionSubmit}>
            <label htmlFor="description2">Description:</label>
            <input
              id="description2"
              type="text"
              name="description"
              placeholder="Project description here"
              required
              value={actionForm.description}
              onChange={onActionInputChange}
            />
            <label htmlFor="notes">Notes:</label>
            <input
              id="notes"
              type="text"
              name="notes"
              placeholder="Project notes here"
              required
              value={actionForm.notes}
              onChange={onActionInputChange}
            />
            <label htmlFor="completed">Completed:</label>
            <input
              id="completed"
              type="checkbox"
              name="completed"
              checked={actionForm.completed ? 'checked' : ''}
              onChange={onActionInputChange}
            />
            <button className="submitProject">Submit</button>
          </form>
        </div>
      </div>
      <br />
      <h1>Projects list</h1>
      <div className="flex">
        {
          projects ? projects.map(project => (
            <div key={project.id} className="col col3">
              <p>ID: {project.id}</p>
              <p>Name: {project.name}</p>
              <p>Description: {project.description}</p>
              <p>This project is {!project.completed && 'NOT'} completed!</p>
              <button className="editProject" onClick={editProject(project.id)}>Edit</button>
              <button className="removeProject" onClick={removeProject(project.id)}>Remove</button>
              <h2>Actions</h2>
              <div className="flex">
                {
                  project.actions ? project.actions.map(action => (
                    <div key={action.id} className="col col1">
                      <p>ID: {action.id}</p>
                      <p>Description: {action.description}</p>
                      <p>Notes: {action.notes}</p>
                      <p>This action is {!action.completed && 'NOT'} completed!</p>
                      <button className="editAction" onClick={editAction(project.id, action.id)}>Edit</button>
                      <button className="removeAction" onClick={removeAction(action.id)}>Remove</button>
                    </div>
                  )) : null
                }

              </div>
            </div>
          )) : null
        }
      </div>
    </div>
  );
}

export default App;
