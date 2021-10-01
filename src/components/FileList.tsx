import React from "react";
import { Button } from "react-bootstrap";
import { client, matrixClient } from "../App";
import { IncomingFile, FileListProps } from "../types/types";
import { faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const FileListViewer: React.FC<FileListProps> = (fileList) => {

  const importFile = async (file: IncomingFile) => {
    if (file.fileName) {
      await client.write(file.fileName, file.body || "")
      fileList.remove(file)
    }
  }

  return (<>
    <h6>Incoming Files</h6>
    {fileList.files.filter((file) => file.fileName && !file.hidden).map((file, index) => {
      return (<>
        <div className='row'>

          <Button className='btn btn-primary w-100' onClick={async () => importFile(file)}>{file.fileName} : Accept</Button>

          <button
            onClick={async () =>
              await fileList.remove(file)
            }
            className="btn btn-danger btn-sm delete3b-btn mt-1"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>

        </div>
      </>)
    })}
  </>)
}