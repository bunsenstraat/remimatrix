import React from 'react'
import useBehaviorSubject from 'use-behavior-subject';
import { client } from './App';

interface loggerProps {

}

export const Logger: React.FC<loggerProps> = ({}) => {
    const log = useBehaviorSubject(client.feedback);
    client.feedback.subscribe((x)=>{

    })
    return (<div>{log}</div>);
}