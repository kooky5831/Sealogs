import React, { useEffect, useState } from 'react'
import db from '../../models/db';
import { UPDATE_CLIENT } from '@/app/lib/graphQL/mutation';
import { useMutation } from '@apollo/client';

const UploadRecord = () => {
    const uploadRecordToServer = () => {
        const recordToSave : string = localStorage.getItem('updatedRecords') || JSON.stringify([]);
        const recordObject : Array<{name:string,data: Array<any>}> = JSON.parse(recordToSave);
        if(recordObject.length > 0 && typeof window != 'undefined') {
            recordObject.map( async (record:{name:string, data:Array<any>}) => {
                db.tables.map(table => {
                    if(record.name == table.name) {
                        
                    }
                })
            })
        }
    }
    useEffect(() => {
        const intervalId = setInterval(() => {
            if(typeof window != "undefined"){
                const updateFlag = localStorage.getItem('updateRecordFlag') || "";
                if(updateFlag == "true") {uploadRecordToServer()}
            }
        },6000);
    });
   
    return (
        <div>
            UploadRecordPage!
        </div>
    )
}

export default UploadRecord
