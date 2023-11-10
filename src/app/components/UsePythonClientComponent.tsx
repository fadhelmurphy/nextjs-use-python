'use client'

import {useState} from "react";
import {helloPython} from "../actions";

export default function UsePythonClientComponent() {

    const [getFromPython, setFromPython] = useState<string>('');

    async function onClick() {
        const output: any = await helloPython();
        setFromPython(output);
    }

    return (
        <>
            <h2>{getFromPython}</h2>
            <button onClick={onClick}>GET FROM PYTHON</button>
        </>
    )

}