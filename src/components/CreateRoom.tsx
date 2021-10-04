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
import { Visibility } from "matrix-js-sdk/lib/@types/partials";

export const CreateRoom: React.FC<any> = (props) => {

    const [name, setName] = useState<string>("")
    const [alias, setAlias] = useState<string>("")
    const [visibility, setVisibility] = useState<Visibility>(Visibility.Public)
    
    const handleChange = ({ target }: any) => {
        setName(target.value);
    };

    const handleChangeAlias = ({ target }: any) => {
        setAlias(target.value);
    };

    const visChange = (vis: Visibility) => {
        setVisibility(vis);
    };

    const createRoom = async () => {
        await matrixClient.createroom(name, alias, "", visibility)

    }

    return (<>
        <Form>
            <Form.Label>Create Room</Form.Label>
            <input placeholder='name eg. myroom' className='form-control w-100' type="text" onChange={handleChange} />
            <input placeholder='alias eg myroom' className='form-control w-100' type="text" onChange={handleChangeAlias} />
            <Form.Label>visibility</Form.Label>
            <input checked={visibility===Visibility.Public} onChange={async () => visChange(Visibility.Public)} type="radio" className='mr-2 ml-2' value='public' name="vis" />public
            <input checked={visibility===Visibility.Private} onChange={async () => visChange(Visibility.Private)} type="radio" className='mr-2 ml-2' value='public' name="vis" />private
            <br></br>
            <div onClick={async()=> await createRoom() } className='btn btn-sm btn-secondary'>create room</div>
        </Form><hr></hr>
    </>)
}