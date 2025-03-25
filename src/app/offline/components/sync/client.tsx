import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { READ_ONE_CLIENT } from '@/app/lib/graphQL/query'
import { UPDATE_CLIENT } from '@/app/lib/graphQL/mutation'
import ClientModel from '../../models/client'
import { CREATE_CLIENT } from '@/app/lib/graphQL/mutation/offline/CREATE_CLIENT'

// REMEMBER: The indexedDB is the source of truth
const SyncClient: React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new ClientModel()
    const [createClient] = useMutation(CREATE_CLIENT, {
        onCompleted: (response) => {
            const data = response.createClient
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Client','error','','sync')
            setUploadError("Client")
        },
    })
    const [UpdateClient] = useMutation(UPDATE_CLIENT, {
        onCompleted: (response) => {
            const data = response.updateClient
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Client','error','','sync')
            setUploadError("Client")
        },
    })
    const [ReadOneClient] = useLazyQuery(READ_ONE_CLIENT,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Client') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Client_NoupdatedRecord!')
                                addSuccessResult('Client','sync')
                                setStorageItem('Client','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('Client','error','','sync')
                            setUploadError("Client")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Client','error','','sync')
            setUploadError("Client")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await ReadOneClient({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneClient
                    const createData = {
                        accountsEmail: record.accountsEmail,
                        adminEmail: record.adminEmail,
                        iconLogoID: record.iconLogoID,
                        id: record.id,
                        logoID: record.logoID,
                        masterTerm: record.masterTerm,
                        phone: record.phone,
                    }
                    const updateData = {
                        accountsEmail: record.accountsEmail,
                        adminEmail: record.adminEmail,
                        iconLogoID: record.iconLogoID,
                        id: record.id,
                        logoID: record.logoID,
                        masterTerm: record.masterTerm,
                        phone: record.phone,
                    }
                    if(checkResult) {
                        UpdateClient({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createClient({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Client")
                })
            })
        )
        setStorageItem('Client','success','100','sync')
        addSuccessResult('Client','sync')
    }
    useEffect(() => {
        setStorageItem('Client','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncClient
