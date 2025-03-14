import React, { useContext, useState, useEffect } from "react";
import UserContext from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const user = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);

  useEffect(() => {
    axios.get("/projects/all").then((res) => {
      console.log(res.data.projects);
      setProject(res.data.projects);
    })
      .catch((err) => console.log(err));
  }, []);

  function handleModalOpen() {
    setIsModalOpen(true);
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    const response = await axios.post("/projects/create", {
      name: projectName,
    }).then((res) => {
      console.log(res);
    })
      .catch((err) => console.log(err));

    setIsModalOpen(false);
    setProjectName("");
  }

  const navigate = useNavigate();

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-4">
        <button
          onClick={handleModalOpen}
          className="project p-4 border border-slate-300 rounded-md"
        >
          New Project
          <i className="ri-link ml-2"></i>
        </button>

        {project.map((project) => (
          <div key={project._id}
            onClick={() => navigate(`/project`, { state: project })}
            className="project p-4 border border-slate-300 flex flex-col gap-2 rounded-md cursor-pointer hover:bg-slate-100 min-w-[200px]"
          >
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <div className="flex justify-between items-center gap-2">
              <i className="ri-user-fill"></i>
              <p className="text-sm text-gray-500">{project.users.length} members</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
