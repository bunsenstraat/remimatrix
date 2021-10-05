import { useContext, useEffect, useRef, useState } from "react";
import { useBehaviorSubject } from "./use-observable"
import "./App.css";
import { WorkSpacePlugin } from "./Client";
import { Logger } from "./logger";
import { MatrixRemix } from "./Matrix";
import { Accordion, AccordionContext, Alert, Button, Modal, useAccordionToggle } from 'react-bootstrap';
import { IncomingFile } from "./types/types";
import { FileListViewer } from "./components/FileList";
import { async } from "rxjs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { RoomSelector } from "./components/Rooms";
import { RoomSearch } from "./components/RoomSearch";
import { CreateRoom } from "./components/CreateRoom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

export const client = new WorkSpacePlugin();
export const matrixClient = new MatrixRemix()


function App() {
  const connected = useBehaviorSubject(
    matrixClient.connected
  );
  const rooms = useBehaviorSubject(
    matrixClient.myRooms
  );
  const incomingFile = useBehaviorSubject(
    matrixClient.incomingFile
  );
  const matrixMessage = useBehaviorSubject(
    matrixClient.message
  );

  const [result, setResult] = useState<string>()
  const [username, setUsername] = useLocalStorage("usernam", "")
  const [password, setPassword] = useLocalStorage("password", "")
  const [autoSend, setAutoSend] = useState(false)
  const [autoReceive, setAutoReceive] = useState(false)
  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([{}])
  const [loginToken, setLoginToken] = useLocalStorage('token', '')
  const [isCallBack, setIsCallback] = useState<boolean>(false)
  const filesRef = useRef(incomingFiles);

  useEffect(() => {
    filesRef.current = incomingFiles;
  }, [incomingFiles]);

  useEffect(() => {
    console.log("ROOMS CHANGE")
    //setIncomingFiles([])
  }, [rooms]);

  useEffect(() => {
    console.log(window.location.search)
    let q = new URLSearchParams(window.location.search)
    console.log(q.get('loginToken'))
    if (q.get('loginToken') && q.get('loginToken') !== '') {
      console.log('setting token')
      setLoginToken(q.get('loginToken') || '')
      setIsCallback(true)
    }

  }, []);

  function addNewContract(file: IncomingFile) {
    if (
      filesRef.current?.findIndex(
        (el: IncomingFile) => el.event_id === file.event_id
      ) === -1
    ) {
      setIncomingFiles(filesRef.current.concat([{ ...file, hidden: false }]));
      console.log(file, incomingFiles)
      client.emit('statusChanged', {
        key: incomingFiles.length,
        type: 'success',
        title: 'messages'
      })
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
    setRoom(target.value);
  };

  const handleChangeToken = ({ target }: any) => {
    setLoginToken(target.value);
  };

  useEffect(() => {
    if (incomingFile) addNewContract(incomingFile)
  }, [incomingFile]);


  const onAutoSendChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    client.autoSend = value
    setAutoSend(value)
    if (value) {
      client.autoReceive = false
      setAutoReceive(false)
    }
  }

  const onAutoReceiveChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    client.autoReceive = value
    setAutoReceive(value)
    if (value) {
      client.autoSend = false
      setAutoSend(false)
    }
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

  const ssoLink = () => {
    let sso = new SSOLoginHelper('https://matrix-client.matrix.org')
    return sso.createSSORedirectURL(window.location.href)
  }

  function CustomToggle(ob: any) {

    const currentEventKey = useContext(AccordionContext);
    const isCurrentEventKey = currentEventKey === ob.eventKey
    const decoratedOnClick = useAccordionToggle(
      ob.eventKey,
      () => ob.callback && ob.callback(ob.eventKey),
    );


    return (
      <>
        <div onClick={decoratedOnClick} className='w-100 list-group-item p-0 pointer mb-1'>
          <Accordion.Toggle eventKey={ob.eventKey}
            as={Button}
            variant="link"
            className='navbutton'
          >

            {ob.children}

          </Accordion.Toggle>
          {
            isCurrentEventKey ? <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretUp}></FontAwesomeIcon> : <FontAwesomeIcon className='ml-2 mr-2 mt-2 float-right' icon={faCaretDown}></FontAwesomeIcon>
          }
        </div>
      </>
    );
  }
  const handleFocus = (event: any) => event.target.select();
  return (
    (isCallBack ? <>
      <div className='container'>
        <h6>Your Login token</h6>
        <div>
          Paste this into the Token field in the app in Remix or reload the plugin. You can close this window.
        </div>
        <input autoFocus onFocus={handleFocus} className='w-100 form-control' type='text' readOnly value={loginToken} />
        <hr></hr>
        <CopyToClipboard
          text={loginToken}
          onCopy={() => {
            alert("Copied to clipboard.");
          }}
        >
          <button className="mt-2 btn btn-primary mb-2 btn-sm">Copy token</button>
        </CopyToClipboard>
      </div>
    </> :
      <div className='container-fluid'>
        {matrixMessage?.content ? <Alert variant={matrixMessage.type}>{matrixMessage.content}</Alert> : <></>}
        {connected ? <><Button className='ml-0 btn btn-secondary w-100' onClick={async () => matrixClient.disconnect()}>Disconnect</Button>{matrixClient.username} </> : <>
          <h6>Login with github etc.</h6>
          
          <a className='' href='https://app.element.io/' target='_blank'>Register</a>
          <a className='btn btn-primary w-100 ml-0' href={ssoLink()} target='_blank'>Get a login token</a>
          <input onFocus={handleFocus} placeholder='paste token here' onChange={handleChangeToken} type='text' className="form-control w-100" value={loginToken} />
          <>
            {connected ? <Button className='ml-0 btn btn-secondary w-100' onClick={async () => matrixClient.disconnect()}>Disconnect</Button> : <Button className='ml-0 btn btn-primary w-100' onClick={async () => await matrixClient.connectToken(username, loginToken)}>Connect with token</Button>}
          </>
          <hr></hr>
          <h6>Login with password</h6>
          <label>Matrix userId</label>
          <input placeholder='userID eg. mike or @mike:matrix.org' className="form-control w-100" type='text' value={username} onChange={userChange} />
          <label>Matrix password</label>
          <input placeholder='password' className="form-control w-100" type='password' value={password} onChange={passwordChange} />
          <>
            {connected ? <Button className='m-0 mt-1 btn btn-secondary w-100' onClick={async () => matrixClient.disconnect()}>Disconnect</Button> : <Button className='m-0 mt-1 btn btn-primary w-100' onClick={async () => connectMatrix()}>Connect with username/password</Button>}
          </>

        </>}

        <hr></hr>
        {!connected ? <></> : <>

          <Accordion>
            <CustomToggle eventKey="0">Rooms</CustomToggle>
            <Accordion.Collapse eventKey="0">
              <>
                <RoomSelector rooms={[]}></RoomSelector>
                <RoomSearch></RoomSearch>
                <CreateRoom></CreateRoom>
              </>
            </Accordion.Collapse>
            <CustomToggle eventKey="1">Chat</CustomToggle>
            <Accordion.Collapse eventKey="1">
              <>
                <FileListViewer remove={removeFile} files={incomingFiles || []}></FileListViewer>
                <label>Automatically send files</label><input name='autosend' className='ml-2' checked={autoSend} onChange={e => onAutoSendChange(e)} type="checkbox" id="autosend" />
                <br></br><label>Automatically receive files</label><input name='autoreceive' className='ml-2' checked={autoReceive} onChange={e => onAutoReceiveChange(e)} type="checkbox" id="autoreceive" />

                <Button className='m-0 mt-1 btn btn-primary w-100 mb-3' onClick={async () => client.createWorkSpace("")}>Create empty workspace</Button>

              </>
            </Accordion.Collapse>
          </Accordion>
        </>}
      </div>)

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


export class SSOLoginHelper {
  private _homeserver: string;
  constructor(homeserver: string) {
    this._homeserver = homeserver;
  }

  get homeserver() { return this._homeserver; }

  createSSORedirectURL(returnURL: string) {
    return `${this._homeserver}/_matrix/client/r0/login/sso/redirect?redirectUrl=${returnURL}`;
  }
}


