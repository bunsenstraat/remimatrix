import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { client, matrixClient } from "../App";
import { IncomingFile, FileListProps } from "../types/types";
import { faTrash, faExclamationTriangle, faDiceD20 } from "@fortawesome/free-solid-svg-icons";
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
              <Button className='badge badge-pill badge-primary mb-0' onClick={async () => importFile(file)}>{file.fileName}</Button>
              {file.message ?
                <div className='small'>{file.message}</div> : <></>}
            </li>

          </>)
        })}

      </ul>
      <span className="m-0 p-0" ref={fieldRef}></span>
    </div>
    <form onSubmit={sendmsg}>
      <input placeholder='Enter to send' className='form-control w-100' type="text" value={message} onChange={handleChange} />
      <input className='btn btn-primary ml-0 w-100' type="submit" value="send" />
    </form>


  </>)
}