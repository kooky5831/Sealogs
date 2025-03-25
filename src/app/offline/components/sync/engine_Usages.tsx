import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import Engine_UsageModel from '../../models/engine_Usage'
import { GET_ENGINEUSEAE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_ENGINEUSEAE_BY_ID'
import { CREAE_ENGINEUSEAGE } from '@/app/lib/graphQL/mutation/offline/CREAE_ENGINEUSEAGE'
import { UPDATE_ENGINE_USEAGE } from '@/app/lib/graphQL/mutation/offline/UPDATE_ENGINE_USEAGE'
// REMEMBER: The indexedDB is the source of truth

const SyncEngine_Usages: React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new Engine_UsageModel()
    const [CreateEngine_Usage] = useMutation(CREAE_ENGINEUSEAGE, {
        onCompleted: (response) => {
            const data = response.createEngine_Usage
            if (typeof window !== 'undefined' && data) {
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Engine_Usages', 'error', '', 'sync')
            setUploadError("Engine_Usages")
        },
    })
    const [UpdateEngine_Usage] = useMutation(UPDATE_ENGINE_USEAGE, {
        onCompleted: (response) => {
            const data = response.updateEngine_Usage
            if (typeof window !== 'undefined' && data) {
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Engine_Usages', 'error', '', 'sync')
            setUploadError("Engine_Usages")
        },
    })
    const [GetEngineUsageById] = useLazyQuery(GET_ENGINEUSEAE_BY_ID, {
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map(async table => {
                if (table.name == 'Engine_Usage') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if (result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Engine_Usages_NoupdatedRecord!')
                                addSuccessResult('Engine_Usages', 'sync')
                                setStorageItem('Engine_Usages', 'success', '100', 'sync')
                            }
                        })
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Engine_Usages', 'error', '', 'sync')
                            setUploadError("Engine_Usages")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Engine_Usages', 'error', '', 'sync')
            setUploadError("Engine_Usages") 
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map(async (record: any) => {
                const id = record.id;
                await GetEngineUsageById({
                    variables: {
                        id: id,
                    },
                })
                    .then((res) => {
                        const checkResult = res.data.readOneCGEventMission
                        const updateData = {
                            engineID: record.engineID,
                            id: record.id,
                            isScheduled: record.isScheduled,
                            lastScheduleHours: record.lastScheduleHours,
                            maintenanceScheduleID: record.maintenanceScheduleID
                        }
                        const createData = {
                            className: record.className,
                            engineID: record.engineID,
                            id: record.id,
                            isScheduled: record.isScheduled,
                            lastScheduleHours: record.lastScheduleHours,
                        }
                        if (checkResult) {
                            UpdateEngine_Usage({
                                variables: {
                                    input: updateData,
                                },
                            })
                        } else {
                            CreateEngine_Usage({
                                variables: {
                                    input: createData,
                                },
                            })
                        }
                    })
                    .catch(err => {
                        console.log('checkRecordError:', err)
                        setUploadError("Engine_Usages")
                    })
            })
        )
        setStorageItem('Engine_Usages', 'success', '100', 'sync')
        addSuccessResult('Engine_Usages', 'sync')
    }
    useEffect(() => {
        setStorageItem('Engine_Usages', 'fetching', '0', 'sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEngine_Usages
