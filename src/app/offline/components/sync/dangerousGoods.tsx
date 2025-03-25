import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import DangerousGoodModel from '../../models/dangerousGood'
import { GET_DANGEROUSGOOD_BY_ID } from '@/app/lib/graphQL/query/offline/GET_DANGEROUSGOOD_BY_ID'
import { CREATE_DANGEROUSGOOD } from '@/app/lib/graphQL/mutation/offline/CREATE_DANGEROUSGOOD'
import { UPDATE_DANGEROUSGOOD } from '@/app/lib/graphQL/mutation/offline/UPDATE_DANGEROUSGOOD'
// REMEMBER: The indexedDB is the source of truth

const SyncDangerousGoods : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new DangerousGoodModel()
        const [CreateDangerousGood] = useMutation(CREATE_DANGEROUSGOOD, {
        onCompleted: (response) => {
            const data = response.createDangerousGood
            if(typeof window !== 'undefined'){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('DangerousGoods','error','','sync')
            setUploadError("DangerousGoods")
        },
    })
    const [UpdateDangerousGood] = useMutation(UPDATE_DANGEROUSGOOD, {
        onCompleted: (response) => {
            const data = response.updateDangerousGood
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('DangerousGoods','error','','sync')
            setUploadError("DangerousGoods")
        },
    })
    const [GetDangerousGoodById] = useLazyQuery(GET_DANGEROUSGOOD_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'DangerousGood') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('DangerousGoods_NoupdatedRecord!')
                                addSuccessResult('DangerousGoods','sync')
                                setStorageItem('DangerousGoods','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('DangerousGoods','error','','sync')
                            setUploadError("DangerousGoods")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('DangerousGoods','error','','sync')
            setUploadError("DangerousGoods")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetDangerousGoodById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneDangerousGood
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateDangerousGood({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateDangerousGood({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("DangerousGoods")
                })
            })
        )        
        setStorageItem('DangerousGoods','success','100','sync')
        addSuccessResult('DangerousGoods','sync')
    }
    useEffect(() => {
        setStorageItem('DangerousGoods','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncDangerousGoods
