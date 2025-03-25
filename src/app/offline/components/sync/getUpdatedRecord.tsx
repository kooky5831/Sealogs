import React, { useEffect } from 'react'
import db from '../../models/db';

const GetUpdatedRecord = () => {
    const setUpdateRecords = (record:Array<any>, flag: boolean) => {
        if(flag) {
            localStorage.setItem('updateRecordFlag','true')
            localStorage.setItem('updatedRecords',JSON.stringify(record))
        } else{
            localStorage.setItem('updateRecordFlag','false')
            localStorage.setItem('updatedRecords',JSON.stringify([]))
        }
    }
    const getAllUpdatedRecords = () => {
        let updatedRecord : Array <any> = []
        db.tables.forEach( async (table, index: number) => {
            await table.where('idbCRUD').equals('Update').toArray()
                .then((result) => {
                    if(result.length > 0) updatedRecord.push({name:table.name, data:result})
                })
                .catch((err) => console.log("readStoreError!", table.name))
            if(index == db.tables.length -1) {
                if(updatedRecord.length > 0) setUpdateRecords(updatedRecord,true);
            }
        })
    }
    useEffect(() => {
        setUpdateRecords([],false);
        getAllUpdatedRecords()
    })
    return (
        <div>GetUpdatedRecord</div>
    )
}

export default GetUpdatedRecord