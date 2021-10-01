import { time } from "console";
import { useEffect, useRef, useState } from "react";
import { useBehaviorSubject } from "./use-observable"
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import { Logger } from "./logger";
import { MatrixRemix } from "./Matrix";
import { Button, Modal } from 'react-bootstrap';
import { IncomingFile } from "./types/types";
import { FileListViewer } from "./components/FileList";
import { async } from "rxjs";


export const client = new WorkSpacePlugin();
export const matrixClient = new MatrixRemix()


function App() {
  const connected = useBehaviorSubject(
    matrixClient.connected
  );
  const incomingFile = useBehaviorSubject(
    matrixClient.incomingFile
  );
  const [dir, setDir] = useState<string>("!FaLewgrNoxRxrSPmWM:matrix.org");
  const [result, setResult] = useState<string>()
  const [username, setUsername] = useLocalStorage("usernam", "@filipmertens:matrix.org")
  const [password, setPassword] = useLocalStorage("password", "RzLIYi81!")
  const [autoSend,setAutoSend] = useState(false)
  const [autoReceive,setAutoReceive] = useState(false)
  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([{}])

  const filesRef = useRef(incomingFiles);


  useEffect(() => {
    filesRef.current = incomingFiles;
  }, [incomingFiles]);



  function addNewContract(file: IncomingFile) {
    if (
      filesRef.current?.findIndex(
        (el: IncomingFile) => el.url === file.url
      ) === -1
    ){
      setIncomingFiles(filesRef.current.concat([{...file, hidden:false}]));
      console.log(file, incomingFiles)
    }
  }

  function removeFile(file: IncomingFile) {
    let c = [...incomingFiles];
    c = c.filter((x: IncomingFile) => {
      return x.url !== file.url;
    });
    setIncomingFiles(c);
  }

  const handleChange = ({ target }: any) => {
    setDir(target.value);
  };
  useEffect(() => {
    if(incomingFile) addNewContract(incomingFile)
  },[incomingFile]);


  const onAutoSendChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    client.autoSend = value
    setAutoSend(value)
  }

  const onAutoReceiveChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    client.autoReceive = value
    setAutoReceive(value)
  }

  const userChange = ({ target }: any) => {
    setUsername(target.value);
  };

  const passwordChange = ({ target }: any) => {
    setPassword(target.value);
  };

  const connectMatrix = async () => {
    await matrixClient.connect(username, password)
  }

  const gettime = () => {
    return Date.now()
  }

  const test = async () => {
    setResult("")
    const r = await client.soltest()
    setResult("test done")
  }

  return (

      <div className='container-fluid'>
        <div>Matrix for Remix</div>
        <div>{result}</div>
        <label>Matrix userId</label>
        <input className="form-control w-100" type='text' value={username} onChange={userChange} />
        <label>Matrix password</label>
        <input className="form-control w-100" type='password' value={password} onChange={passwordChange} />
        <label>Matrix roomID</label>
        <input
          type="text"
          name="payloadBox"
          className="form-control w-100"
          placeholder="Enter payload here..."
          value={dir}
          onChange={handleChange}
        />
        <label>Automatically send files</label><input name='autosend' className='ml-2' checked={autoSend} onChange={e => onAutoSendChange(e)} type="checkbox" id="autosend" />
        <br></br><label>Automatically receive files</label><input name='autoreceive' className='ml-2' checked={autoReceive} onChange={e => onAutoReceiveChange(e)} type="checkbox" id="autoreceive" />
        <>
          {connected ? <Button className='m-0 mt-1 btn btn-secondary w-100' onClick={async () => matrixClient.disconnect()}>Disconnect</Button> : <Button className='m-0 mt-1 btn btn-primary w-100' onClick={async () => connectMatrix()}>Connect</Button>}
        </>
        <Button className='m-0 mt-1 btn btn-primary w-100 mb-3' onClick={async () => client.createWorkSpace("")}>Create empty workspace</Button>
        <hr></hr>
        <FileListViewer remove={removeFile} files={incomingFiles || []}></FileListViewer>
      </div>

  );
}


// Hook
export const useLocalStorage = (key: string, initialValue: any) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<any>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue

      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any | ((val: any) => any)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case

    }
  };
  return [storedValue, setValue] as const;
}
export default App;
