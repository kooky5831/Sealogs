import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import FavoriteLocationModel from '../../models/favoriteLocation'
import { GET_FAVORITELOCATION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_FAVORITELOCATION_BY_ID'
import { CREATEFAVORITELOCATION } from '@/app/lib/graphQL/mutation/offline/CREATEFAVORITELOCATION'
import { UPDATE_FAVORITELOCATION } from '@/app/lib/graphQL/mutation/offline/UPDATE_FAVORITELOCATION'
// REMEMBER: The indexedDB is the source of truth

const SyncFavoriteLocations : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new FavoriteLocationModel()
    const [CreateFavoriteLocation] = useMutation(CREATEFAVORITELOCATION, {
        onCompleted: (response) => {
            const data = response.createFavoriteLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('FavoriteLocations','error','','sync')
            setUploadError("FavoriteLocations")
        },
    })
    const [Update_FavoriteLocation] = useMutation(UPDATE_FAVORITELOCATION, {
        onCompleted: (response) => {
            const data = response.updateFavoriteLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('FavoriteLocations','error','','sync')
            setUploadError("FavoriteLocations")
        },
    })
    const [Get_FavoriteLocationById] = useLazyQuery(GET_FAVORITELOCATION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'FavoriteLocation') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('FavoriteLocations_NoupdatedRecord!')
                                addSuccessResult('FavoriteLocations','sync')
                                setStorageItem('FavoriteLocations','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('FavoriteLocations','error','','sync')
                            setUploadError("FavoriteLocations")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('FavoriteLocations','error','','sync')
            setUploadError("FavoriteLocations")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_FavoriteLocationById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneFavoriteLocation
                    const updateData = {
                        className: record.className,
                        created: record.created,
                        fileTracking: record.fileTracking,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        memberID: record.memberID,
                        usage: record.usage,
                    }
                    const createData = {
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        memberID: record.memberID,
                    }
                    if(checkResult) {
                        Update_FavoriteLocation({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateFavoriteLocation({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("FavoriteLocations")
                })
            })
        )
        setStorageItem('FavoriteLocations','success','100','sync')
        addSuccessResult('FavoriteLocations','sync')
    }
    useEffect(() => {
        setStorageItem('FavoriteLocations','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncFavoriteLocations
