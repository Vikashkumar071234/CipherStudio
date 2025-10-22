// import IDE from "./components/IDE";

// function App() {
//   return <IDE />;
// }

// export default App;

import { useEffect, useState } from "react";
import IDE from "./components/IDE";

function App() {
  const [projects, setProjects] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL; // This should point to your Render backend

  useEffect(() => {
    fetch(`${apiUrl}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
  }, [apiUrl]);

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, Roboto, sans-serif" }}>
      <h1>CipherStudio Projects</h1>
      {projects.length === 0 ? (
        <p>No projects yet!</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p._id}>{p.projectName}</li>
          ))}
        </ul>
      )}

      <IDE /> {/* Your IDE component below the project list */}
    </div>
  );
}

export default App;