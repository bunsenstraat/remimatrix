import { time } from "console";
import { useState } from "react";
import useBehaviorSubject from "use-behavior-subject";
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import { Logger } from "./logger";



export const client = new WorkSpacePlugin();



function App() {
  
  const [dir, setDir] = useState<string>("hardhat");
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
      <a href='http://nu.nl' target="_blank">testlink</a>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.zip()}>zip</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.ipfspush()}>ipfs push</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.ipfspull(dir)}>ipfs pull</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.ipfsConfig()}>ipfs config</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getAccounts()}>get accounts</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.setSettings()}>set settings to injected</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getSettings()}>get settings</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await test()}>run sol test</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.highlight(dir)}>highlight</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.addAnnotation(dir)}>annotation</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.clearAnnotations(dir)}>clear annotation</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.open(dir)}>openfile</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.read(dir)}>read</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.write(dir)}>write</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.switchfile(dir)}>switch to file</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getcurrentfile()}>getcurrentfile</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.importcontent(dir)}>import content resolve</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.fetch(dir)}>api test fetch</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.axios(dir)}>api test axios</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.activate()}>activate</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.deactivate()}>deactivate</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getresult()}>get compilation result</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getcompilerconfig()}>get compiler config</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getWorkSpace()}>get workspace</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.getWorkSpaces()}>get workspaces</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.createWorkSpace(dir)}>create workspace</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitinit(dir)}>git init</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitstatus(dir)}>git status</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitlog()}>git log</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitcommit()}>git commit</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitadd(dir)}>git add</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitremove(dir)}>git rm</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitlsfiles()}>git ls files</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitreadblob(dir)}>git read blob</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitresolveref()}>git resolve head</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitbranches()}>git branches</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitbranch(dir)}>git create branch</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitcheckout(dir)}>git checkout</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.gitcurrentbranch()}>git current branch</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.qr(dir)}>qr</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.wallet()}>connect to wallet</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.connect()}>connect to wallet2</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.dapp(dir)}>connect to dapp</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.changetoinjected()}>change to injected</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.writetoCeramic()}>ceramic write</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.pinatapush()}>pinata write</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.pinlist()}>pinata list</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.setCallBacks()}>callbacks</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.log("")}>log</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.activatePlugin(dir)}>activate</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.deActivatePlugin(dir)}>deactivate</button>
      <button className='btn btn-primary btn-sm'  onClick={async () => await client.debug(dir)}>debug</button>
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
