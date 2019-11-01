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

function App() {
  const baseUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API : '';

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(initialProjectFormState);
  const [isEditingProject, setEditingProject] = useState(0);

  useEffect(() => {
    axios.get(baseUrl + '/api/projects').then(response => {
      console.log(response.data);
      setProjects(response.data);
    }).catch(err => console.log(err));
  }, []);

  const onProjectInputChange = e => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
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

  const editProject = id => e => {
    setEditingProject(id);
    setProjectForm(projects.find(project => Number(project.id) === Number(id)))
  }

  const removeProject = id => e => {
    axios.delete(baseUrl + '/api/projects/' + id).then(response => {
      setProjects(projects.filter(project => Number(project.id) !== Number(response.data.id)));
    }).catch(err => console.log(err));
  }

  return (
    <div className="App">
      <h2>Projects form</h2>
      <form onSubmit={onProjectSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Project name here"
          required
          value={projectForm.name}
          onChange={onProjectInputChange}
        />
        <button className="submitProject">Submit</button>
      </form>
      <br />
      <h1>Projects list</h1>
      <div className="flex">
        {
          projects ? projects.map(project => (
            <div key={project.id} className="col col3">
              <p>ID: {project.id}</p>
              <p>Name: {project.name}</p>
              <p>Description: {project.description}</p>
              <button className="editProject" onClick={editProject(project.id)}>Edit</button>
              <button className="removeProject" onClick={removeProject(project.id)}>Remove</button>
              <h2>Actions</h2>
              <div className="flex">
                {
                  project.actions ? project.actions.map(action => (
                    <div className="col col1">
                      <p>ID: {action.id}</p>
                      <p>Description: {action.description}</p>
                      <p>Notes: {action.notes}</p>
                      {/* <p>Text: {post.text}</p> */}
                      {/* <button className="editPost" onClick={editPost(post.id, project.id)}>Edit</button> */}
                      {/* <button className="removePost" onClick={removePost(post.id, project.id)}>Remove</button> */}
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
