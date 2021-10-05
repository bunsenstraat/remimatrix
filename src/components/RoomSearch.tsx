import React, { useEffect, useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";
import { client, matrixClient } from "../App";
import { faTrash, faExclamationTriangle, faDiceD20 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IPublicRoomsChunkRoom, Room } from "matrix-js-sdk";
import SelectSearch, { SelectSearchOption } from 'react-select-search';
import { useBehaviorSubject } from "../use-observable";

import './RoomSearch.css'
import { async } from "rxjs";

export const RoomSearch: React.FC<any> = (props) => {
    const [rooms, setRooms] = useState<IPublicRoomsChunkRoom[]>([])
    const [query, setQuery] = useState<string>("")
    const selectRoom = (event: any) => {
        console.log(event.target.value)
        matrixClient.setRoomId(event.target.value)
    }
    
    const handleChange = ({ target }: any) => {
        setQuery(target.value);
      };

    const searchroom = async (event:any) => {
        event.preventDefault();   
        let result = await matrixClient.searchRooms(query)
        console.log(result.chunk)
        setRooms(result.chunk)     
    }

    const joinroom = async(room_id: string) => {
        setRooms([])
        await matrixClient.joinroom(room_id)
    }

    return (<>
        <form onSubmit={searchroom}>
            <Form.Label>Search rooms</Form.Label>
            <input placeholder='Hit ENTER to search a room' className='form-control w-100' type="text" onChange={handleChange} />
            <div onClick={async()=> { setRooms([]); }} className='badge bagde-secondary'>clear search</div>
        </form>
        <ul className='pl-0'>
            {rooms.map((room)=>{
                return(<li className='pl-0'><div onClick={async() => joinroom(room.room_id)} className='badge badge-primary mr-2'>Join room</div>{room.name}</li>)
            })}
            
        </ul>
    </>)
}