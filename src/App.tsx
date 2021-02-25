import { time } from "console";
import { useState } from "react";
import useBehaviorSubject from "use-behavior-subject";
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import { Logger } from "./logger";

export const client = new WorkSpacePlugin();

function App() {
  
  const [dir, setDir] = useState<string>("T8.sol");
  const [result,setResult] = useState<string>()



  const handleChange = ({ target }: any) => {
    setDir(target.value);
  };

  const gettime = () => {
    return Date.now()
  }

  const test = async ()=>{
    setResult("")
    const r = await client.soltest()
    setResult("test done")
  }

  return (
    <div className="App">
      <div>v5</div>
      <div>{result}</div>
      <button onClick={async () => await client.getAccounts()}>get accounts</button>
      <button onClick={async () => await client.setSettings()}>set settings to injected</button>
      <button onClick={async () => await client.getSettings()}>get settings</button>
      <button onClick={async () => await test()}>run sol test</button>
      <button onClick={async () => await client.highlight(dir)}>highlight</button>
      <button onClick={async () => await client.addAnnotation(dir)}>annotation</button>
      <button onClick={async () => await client.clearAnnotations(dir)}>clear annotation</button>
      <button onClick={async () => await client.open(dir)}>openfile</button>
      <button onClick={async () => await client.read(dir)}>read</button>
      <button onClick={async () => await client.write(dir)}>write</button>
      <button onClick={async () => await client.switchfile(dir)}>switch to file</button>
      <button onClick={async () => await client.getcurrentfile()}>getcurrentfile</button>
      <button onClick={async () => await client.importcontent(dir)}>import content resolve</button>
      <button onClick={async () => await client.fetch(dir)}>api test fetch</button>
      <button onClick={async () => await client.axios(dir)}>api test axios</button>
      <input
        type="text"
        name="payloadBox"
        placeholder="Enter payload here..."
        value={dir}
        onChange={handleChange}
      />
    </div>
  );
}

export default App;
