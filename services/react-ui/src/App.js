import React from 'react';
import Sidebar from './Sidebar'; // Import the Sidebar component
import AIServices from './AIServices'; // Import the AIServices component
import UserProfile from './UserProfile'; // Import the UserProfile component
import SearchBar from './SearchBar'; // Import the SearchBar component

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '20px' }}>
        <SearchBar />
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '1200px', marginTop: '20px' }}>
          <UserProfile />
          <AIServices />
        </div>
      </div>
    </div>
  );
}

export default App;
