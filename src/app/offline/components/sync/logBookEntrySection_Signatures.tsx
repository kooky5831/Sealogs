import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CreateLogBookEntrySection_Signature,  UpdateLogBookEntrySection_Signature } from '@/app/lib/graphQL/mutation'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import LogBookEntrySection_SignatureModel from '../../models/logBookEntrySection_Signature'
import { LogbookEntrySection_Signature } from '@/app/lib/graphQL/query/logEntrySections/LogbookEntrySection_Signature'

// REMEMBER: The indexedDB is the source of truth
const SyncLogBookEntrySection_Signatures : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new LogBookEntrySection_SignatureModel()
    const [createlogbookentrysection_signature] = useMutation(CreateLogBookEntrySection_Signature, {
        onCompleted: (response) => {
            const data = response.createLogBookEntrySection_Signature
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('LogBookEntrySection_Signatures','error','','sync')
            setUploadError("LogBookEntrySection_Signatures")
        },
    })
    const [updatelogbookentrysection_signature] = useMutation(UpdateLogBookEntrySection_Signature, {
        onCompleted: (response) => {
            const data = response.updateLogBookEntrySection_Signature
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('LogBookEntrySection_Signatures','error','','sync')
            setUploadError("LogBookEntrySection_Signatures")
        },
    })
    const [GetLogbookEntrySection_Signature] = useLazyQuery(LogbookEntrySection_Signature,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'LogBookEntrySection_Signature') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('LogBookEntrySection_Signatures_NoupdatedRecord!')
                                setStorageItem('LogBookEntrySection_Signatures','success','100','sync')
                                addSuccessResult('LogBookEntrySection_Signatures','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('LogBookEntrySection_Signatures','error','','sync')
                            setUploadError("LogBookEntrySection_Signatures")
                        });
                }
            })
        } catch (error) {
            setStorageItem('LogBookEntrySection_Signatures','error','','sync')
            setUploadError("LogBookEntrySection_Signatures")
            console.error('Error retrieving records:', error);
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetLogbookEntrySection_Signature({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneLogBookEntrySection_Signature;
                    const updateData = {
                        id: record.id,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        memberID: record.memberID,
                    }
                    const createData = {
                        id: record.id,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        memberID: record.memberID ,
                    }
                    if(checkResult != null) {
                        updatelogbookentrysection_signature({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createlogbookentrysection_signature({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("LogBookEntrySection_Signatures")
                })
            })
        )
        setStorageItem('LogBookEntrySection_Signatures','success','100','sync')
        addSuccessResult('LogBookEntrySection_Signatures','sync')
    }
    useEffect(() => {
        setStorageItem('LogBookEntrySection_Signatures','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncLogBookEntrySection_Signatures
