import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import RefuellingBunkeringModel from '../../models/refuellingBunkering'
import { GET_REFUELLINGBUNKERING_BY_ID } from '@/app/lib/graphQL/query/offline/GET_REFUELLINGBUNKERING_BY_ID'
import { CREATE_REFUELLINGBUNKERING } from '@/app/lib/graphQL/mutation/offline/CREATE_REFUELLINGBUNKERING'
import { UPDATE_REFUELLINGBUNKERING } from '@/app/lib/graphQL/mutation/offline/UPDATE_REFUELLINGBUNKERING'
// REMEMBER: The indexedDB is the source of truth

const SyncRefuellingBunkerings : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new RefuellingBunkeringModel()
        const [CreateRefuellingBunkering] = useMutation(CREATE_REFUELLINGBUNKERING, {
        onCompleted: (response) => {
            const data = response.createRefuellingBunkering
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('RefuellingBunkerings','error','','sync')
            setUploadError("RefuellingBunkerings")
        },
    })
    const [UpdateRefuellingBunkering] = useMutation(UPDATE_REFUELLINGBUNKERING, {
        onCompleted: (response) => {
            const data = response.updateRefuellingBunkering
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('RefuellingBunkerings','error','','sync')
            setUploadError("RefuellingBunkerings")
        },
    })
    const [GetRefuellingBunkeringById] = useLazyQuery(GET_REFUELLINGBUNKERING_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'RefuellingBunkering') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('RefuellingBunkerings_NoupdatedRecord!')
                                addSuccessResult('RefuellingBunkerings','sync')
                                setStorageItem('RefuellingBunkerings','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('RefuellingBunkerings','error','','sync')
                            setUploadError("RefuellingBunkerings")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('RefuellingBunkerings','error','','sync')
            setUploadError("RefuellingBunkerings")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetRefuellingBunkeringById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneRefuellingBunkering
                    const updateData = {
                        date: record.date,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        notes: record.notes,
                        title: record.title,
                        tripEventID: record.tripEventID,
                    }
                    const createData = {
                        date: record.date,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        notes: record.notes,
                        title: record.title,
                        tripEventID: record.tripEventID,
                    }
                    if(checkResult) {
                        UpdateRefuellingBunkering({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateRefuellingBunkering({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("RefuellingBunkerings")
                })
            })
        )
        setStorageItem('RefuellingBunkerings','success','100','sync')
        addSuccessResult('RefuellingBunkerings','sync')
    }
    useEffect(() => {
        setStorageItem('RefuellingBunkerings','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncRefuellingBunkerings
