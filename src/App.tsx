import { useState } from 'react';
import './App.css';
import { WorkSpacePlugin } from './Client';

export const client = new WorkSpacePlugin()

function App() {

  const [dir,setDir] = useState<string>("/")

  const handleChange = ({target}:any)=>{
    setDir(target.value)
  }

  return (
    <div className="App">
      <button onClick={async()=>await client.read(dir)}>read</button>
      <button onClick={async()=>await client.write(dir)}>write</button>
      <input 
        type="text" 
        name="payloadBox" 
        placeholder="Enter payload here..."
        value={ dir } 
        onChange={ handleChange } 
      />
    </div>
  );
}

export default App;
