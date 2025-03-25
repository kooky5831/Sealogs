'use client'
import React, { useEffect, useState } from 'react'
import { initialDataResult } from '../offline/helpers/functions'

const VisualIndicator = () => {
    const [result, setResult] = useState(initialDataResult);
    const [render, setRender] = useState(new Date().toLocaleString())
    useEffect(() => {
        const intervalIds = setInterval(() => {
            let tempResult = initialDataResult;
            if(typeof window !== 'undefined') {
                const sync: string | null =
                        localStorage.getItem('dataSyncResult')
                const syncObject: Array<string> = sync
                    ? JSON.parse(sync)
                    : []
                const fetch: string | null =
                        localStorage.getItem('dataFetchResult')
                const fetchObject: Array<string> = fetch
                    ? JSON.parse(fetch)
                    : []
                if(fetchObject.length > 0) { 
                    fetchObject.map((obj: any) => {
                        if(obj.result == "fetching") {
                            tempResult.map(res => {
                                res.name == obj.name ? res.fetch = obj.progress : null;
                            }) 
                        }else {
                            tempResult.map(res => {
                                res.name == obj.name ? res.fetch = obj.result : null;
                            }) 
                        }
                    })
                } 
                if(syncObject.length > 0) {
                    syncObject.map( (obj : any) => {
                        if(obj.result == 'fetching') {
                            tempResult.map(res => {
                                res.name == obj.name ? res.sync = obj.progress : null;
                            })
                        } else {
                            tempResult.map(res => {
                                res.name == obj.name ? res.sync = obj.result : null;
                            })
                        }
                    })
                }
                setResult(tempResult)
                setRender(new Date().toLocaleString())
            }
        }, 2000)
        return () => clearInterval(intervalIds);
    })
    return (
        <table style={{width:'80%'}}>
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th>fetch status</th>
                    <th>sync status</th>
                </tr>
            </thead>
            <tbody>
                {result.map((data : any) => (
                    <tr key={data.name}>
                        <td style={{border:'1px solid black'}}>{data.name}</td>
                        <td style={{border:'1px solid black'}}>{data.fetch}</td>
                        <td style={{border:'1px solid black'}}>{data.sync}</td>
                    </tr>
                ))}         
            </tbody>
        </table>
    )
}

export default VisualIndicator