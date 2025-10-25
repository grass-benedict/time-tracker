import { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')  // Uses proxy from package.json
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <ul>
        {users.length === 0 ? (
          <li>Loading...</li>
        ) : (
          users.map(u => <li key={u.id}>{u.name}</li>)
        )}
      </ul>
    </div>
  );
}

export default App;
