import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { client, matrixClient } from "../App";
import { IncomingFile, FileListProps } from "../types/types";
import { faTrash, faExclamationTriangle, faDiceD20, faFolder, faFileImport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { default as dateFormat } from 'dateformat'



export const FileListViewer: React.FC<FileListProps> = (fileList) => {
  const [message, setMsg] = useState<string>()
  const fieldRef = React.useRef<HTMLInputElement>(null);

  const importFile = async (file: IncomingFile) => {
    if (file.fileName) {
      await client.write(file.fileName, file.body || "")
      //fileList.remove(file)
    }
  }
  const clone = async (file: IncomingFile) => {
    if (file.message) {
      try{      
        await client.call("dGitProvider", "clone" as any, { url:file.message, branch:'', token:'', depth: 10, singleBranch:false });
        await client.call('menuicons' as any, 'select', 'filePanel')
      }catch(e){
        throw e
      }
    }
  }

  const importWorkspace = async (file: IncomingFile) => {
    if (file.message) {
      const parts = file.message.split("ipfs://")
      try{      
        await client.call('dGitProvider' as any,'import', {cid: parts[1], local: false} )
        await client.call('menuicons' as any, 'select', 'filePanel')
      }catch(e){
        throw e
      }
    }
  }
  function sendmsg(event: any) {
    if (message) {
      matrixClient.sendmessage(message).then(() => {
        setMsg('')
        if (fieldRef && fieldRef.current)
          fieldRef.current.scrollIntoView();
      }
      )
    }
    event.preventDefault();

  }

  function previewWorkspace(file: IncomingFile){
    if (file.message) {
      const parts = file.message.split("ipfs://")
      const url = `https://ipfs.remixproject.org/ipfs/${parts[1]}`
      return <a className='small ml-2' rel="noreferrer" target='_blank' href={url}>preview</a>
    }
  }

  function previewGitHub(file: IncomingFile){
    if (file.message) {
      return <a className='small ml-2' rel="noreferrer" target='_blank' href={file.message}>preview</a>
    }
  }

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.scrollIntoView();
    }
  }, []);

  const handleChange = ({ target }: any) => {
    setMsg(target.value);
  };

  return (<>
    <div className=' chatwindow'>
      <ul className="list-group">
        {fileList.files.filter((f) => f && f.timestamp).sort((f1, f2) => f1.timestamp! - f2.timestamp!).filter((f) => (f.message || f.url) && f.roomId === matrixClient.roomId).map((file, index) => {
          return (<>

            <li className="list-group-item ml-0 pl-1">
              <div className='small text-muted'>{file.userId}<br></br>{dateFormat(file.timestamp, "dd, mmmm h:MM:ss TT")}</div>
              <Button className='badge badge-pill badge-primary mb-0' onClick={async () => await importFile(file)}>{file.fileName}</Button>
              {file.message ?
                file.message.includes('ipfs://')? <><Button className='w-100 badge badge-pill badge-info mb-0 text-truncate' onClick={async () => await importWorkspace(file)}><FontAwesomeIcon icon={faFileImport} /> workspace : {file.message}</Button><br></br>{previewWorkspace(file)}</>:
                file.message.includes('github.com')? <><Button className='w-100 badge badge-pill badge-dark mb-0 text-truncate' onClick={async () => await clone(file)}><FontAwesomeIcon icon={faFileImport} /> github : {file.message}</Button><br></br>{previewGitHub(file)}</>:
  
                <div className='small text-break w-100'>{file.message}</div>
                 : <></>}
            </li>

          </>)
        })}

      </ul>
      <span className="m-0 p-0" ref={fieldRef}></span>
    </div>
    <form onSubmit={sendmsg}>
      <input placeholder='Enter to send' className='form-control w-100' type="text" value={message} onChange={handleChange} />
      <input className='btn btn-primary ml-0 w-100 d-none' type="submit" value="send" />
    </form>


  </>)
}