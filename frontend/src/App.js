import { useEffect, useState } from "react";

export default function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CipherStudio Projects</h1>

      {projects.length === 0 ? (
        <p>No projects yet!</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p._id}>
              {p.projectName ? p.projectName : "Untitled Project"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}