import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MemberTraining_SignatureModel from '../../models/memberTraining_Signature'
import { CREATE_MEMBER_TRAINING_SIGNATURE, UPDATE_MEMBER_TRAINING_SIGNATURE } from '@/app/lib/graphQL/mutation'
import { GET_MEMBERTRAINING_SIGNATURE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_MEMBERTRAINING_SIGNATURE_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncMemberTraining_Signatures: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
    const model = new MemberTraining_SignatureModel()
    const [CreateMemberTraining_Signature] = useMutation(CREATE_MEMBER_TRAINING_SIGNATURE, {
        onCompleted: (response) => {
            const data = response.createMemberTraining_Signature
            if(typeof window !== 'undefined'&& data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MemberTraining_Signatures','error','','sync')
            setUploadError("MemberTraining_Signatures")
        },
    })
    const [UpdateMemberTraining_Signature] = useMutation(UPDATE_MEMBER_TRAINING_SIGNATURE, {
        onCompleted: (response) => {
            const data = response.updateMemberTraining_Signature
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MemberTraining_Signatures','error','','sync')
            setUploadError("MemberTraining_Signatures")
        },
    })
    const [GetOneMemberTraining_Signature] = useLazyQuery(GET_MEMBERTRAINING_SIGNATURE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MemberTraining_Signature') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MemberTraining_Signatures_NoupdatedRecord!')
                                setStorageItem('MemberTraining_Signatures','success','100','sync')
                                addSuccessResult('MemberTraining_Signatures','sync')
                            }})
                            .catch((err) => {
                                console.log("read record Error:",table.name)
                                setStorageItem('MemberTraining_Signatures','error','','sync')
                                setUploadError("MemberTraining_Signatures")
                            });
                }
            })
        } catch (error) {
            setStorageItem('MemberTraining_Signatures','error','','sync')
            console.error('Error retrieving records:', error);
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetOneMemberTraining_Signature({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMemberTraining_Signature
                    const updateData = {
                        id: record.id,
                        memberID: record.memberID,
                        signatureData: record.signatuerData,
                        trainingSessionID: record.trainingSessionID,
                    }
                    const createData = {
                        id: record.id,
                        memberID: record.memberID,
                        signatureData: record.signatureData,
                        trainingSessionID: record.trainingSessionID,
                    }
                    if(checkResult) {
                        UpdateMemberTraining_Signature({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateMemberTraining_Signature({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MemberTraining_Signatures")
                })
            })
        )
        setStorageItem('MemberTraining_Signatures','success','100','sync')
        addSuccessResult('MemberTraining_Signatures','sync')
    }
    useEffect(() => {
        setStorageItem('MemberTraining_Signatures','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMemberTraining_Signatures
