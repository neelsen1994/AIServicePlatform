import React from 'react';

function UserProfile() {
  return (
    <div style={{ flex: 1, padding: '20px', height: '130px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', marginRight: '20px', backgroundColor: 'lightgreen' }}>
      <h2>User Profile</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px', width: '90px', borderRadius: '5px', backgroundColor:  'white' }}><a href="#analytics" style={{ marginLeft: '25px', color: 'black', textDecoration: 'none' }}>Login</a></li>
      </ul>
    </div>
  );
}

export default UserProfile;