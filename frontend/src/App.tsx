import Upload from './Upload';


function App() {
  function getLogInRedirect(){
    fetch("http://localhost:8888");
    return "asdfg"
  }
  return (
    <>
      <div className="dashboard">
        <button onClick={getLogInRedirect}>Log in</button>
        <button>Sign in</button>
      </div>
      <div id="upload"></div>
      <Upload></Upload>
    </>
  );
}

export default App;

