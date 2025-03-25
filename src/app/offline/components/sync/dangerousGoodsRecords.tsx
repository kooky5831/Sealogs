import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import DangerousGoodsRecordModel from '../../models/dangerousGoodsRecord'
import { GET_ONEDANGEROUSGOODRECORD_BY_ID } from '@/app/lib/graphQL/query/offline/GET_ONEDANGEROUSGOODRECORD_BY_ID'
import { CREATE_DANGEROUSGOODRECORD } from '@/app/lib/graphQL/mutation/offline/CREATE_DANGEROUSGOODRECORD'
import { UPDATE_DANGEROUSGOODRECORD } from '@/app/lib/graphQL/mutation/offline/UPDATE_DANGEROUSGOODRECORD'
// REMEMBER: The indexedDB is the source of truth

const SyncDangerousGoodsRecords : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new DangerousGoodsRecordModel()
    const [CreateDangerousGoodsRecord] = useMutation(CREATE_DANGEROUSGOODRECORD, {
        onCompleted: (response) => {
            const data = response.createDangerousGoodsRecord
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('DangerousGoodsRecords','error','','sync')
            setUploadError("DangerousGoodsRecords")
        },
    })
    const [UpdateDangerousGoodsRecord] = useMutation(UPDATE_DANGEROUSGOODRECORD, {
        onCompleted: (response) => {
            const data = response.updateDangerousGoodsRecord
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('DangerousGoodsRecords','error','','sync')
            setUploadError("DangerousGoodsRecords")
        },
    })
    const [GetOneDangerousGoodsRecordById] = useLazyQuery(GET_ONEDANGEROUSGOODRECORD_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'DangerousGoodsRecord') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('DangerousGoodsRecords_NoupdatedRecord!')
                                addSuccessResult('DangerousGoodsRecords','sync')
                                setStorageItem('DangerousGoodsRecords','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('DangerousGoodsRecords','error','','sync')
                            setUploadError("DangerousGoodsRecords")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('DangerousGoodsRecords','error','','sync')
            setUploadError("DangerousGoodsRecords")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetOneDangerousGoodsRecordById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneDangerousGoodsRecord
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        comment: record.comment,
                        created: record.created,
                        dangerousGoodID: record.dangerousGoodID,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        tripReport_StopID: record.tripReport_StopID,
                        type: record.type,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        clientID: record.clientID,
                        comment: record.comment,
                        dangerousGoodID: record.dangerousGoodID,
                        id: record.id,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        tripReport_StopID: record.tripReport_StopID,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateDangerousGoodsRecord({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateDangerousGoodsRecord({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("DangerousGoodsRecords")
                })
            })
        )
        setStorageItem('DangerousGoodsRecords','success','100','sync')
        addSuccessResult('DangerousGoodsRecords','sync')
    }
    useEffect(() => {
        setStorageItem('DangerousGoodsRecords','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncDangerousGoodsRecords
