import Upload from './Upload';
import { useState } from 'react';

function App() {

  const [profileData, setProfileData] = useState({display_name:""})

  async function getLogInRedirect() {
    return await fetch("http://localhost:8888/login").then(response => response.text())
  }
  async function getMe() {
    let code = window.location.href.split('/').pop()
    return await fetch("http://localhost:8888/yo",
      {
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + code,
        }
      }
    ).then(response => response.json()).then(x => { setProfileData(x) })
  }
  return (
    <>
      <div className="dashboard">
        <button onClick={() => { getLogInRedirect().then(x => { window.location.href = x.replace(/['"]+/g, ''); }) }}>Log in</button>
        <button onClick={() => { getMe().then(x => { console.log(x) }) }}>get me</button>
        {profileData ? <>
          <p>{profileData.display_name}</p>
        </> : <p>No Data to display</p>}
        <button>Sign in</button>
      </div>
      <div id="upload"></div>
      <Upload></Upload>
    </>
  );
}

export default App;

