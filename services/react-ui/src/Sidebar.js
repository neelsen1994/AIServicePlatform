import React from 'react';

function Sidebar() {
  return (
    <div style={{ width: '300px', backgroundColor: 'black', color: 'white', padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Dashboard</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px' }}><a href="#analytics" style={{ color: 'white', textDecoration: 'none' }}>Analytics</a></li>
        <li><a href="#documentation" style={{ color: 'white', textDecoration: 'none' }}>Documentation</a></li>
      </ul>
    </div>
  );
}

export default Sidebar;
