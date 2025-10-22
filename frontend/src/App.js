// import IDE from "./components/IDE";

// function App() {
//   return <IDE />;
// }

// export default App;


import { useEffect, useState } from "react";
import IDE from "./components/IDE";

function App() {
  const [projects, setProjects] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Updated useEffect with apiUrl dependency
  useEffect(() => {
    fetch(`${apiUrl}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
  }, [apiUrl]); // <-- add apiUrl here

  return (
    <div>
      <h1>CipherStudio Projects</h1>
      <ul>
        {projects.map(p => (
          <li key={p._id}>{p.projectName}</li>
        ))}
      </ul>

      <IDE /> {/* IDE still rendered below */}
    </div>
  );
}

export default App;
