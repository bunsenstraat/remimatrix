import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { client, matrixClient } from "../App";
import { faTrash, faExclamationTriangle, faDiceD20 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Room } from "matrix-js-sdk";
import SelectSearch, { SelectSearchOption } from 'react-select-search';
import { useBehaviorSubject } from "../use-observable";

interface RoomProps {
    rooms: Room[]
}

export const RoomSelector: React.FC<RoomProps> = (rooms) => {
    let myRooms = useBehaviorSubject(matrixClient.myRooms)

    const selectRoom = (event:any) => {
        console.log(event.target.value)
        matrixClient.setRoomId(event.target.value)
    }

    return(<>
        <Form>
        <Form.Group controlId="exampleForm.SelectCustom">
            <Form.Label>Select Room</Form.Label>
            <Form.Control onChange={selectRoom} as="select" custom>
            {myRooms?.map((r:Room)=>{
                return (
                    <option value={r.roomId}>{r.name}</option>
                )
            })}
            </Form.Control>
            <div onClick={async()=> await matrixClient.leaveroom() } className='badge bagde-secondary'>leave room</div>
        </Form.Group>
        </Form>
        
    </>)
}