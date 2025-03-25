import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_VesselRescueModel from '../../models/eventType_VesselRescue'
import { GET_EVENTTYPEVESSEL_RESCUE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPEVESSEL_RESCUE_BY_ID'
import { CRATEEVENTTYPE_VESSELRESCUE } from '@/app/lib/graphQL/mutation/offline/CRATEEVENTTYPE_VESSELRESCUE'
import { UPDATE_EVENTTYPE_VESSELRESCUE } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_VESSELRESCUE'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_VesselRescues : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_VesselRescueModel()
    const [CreateEventType_VesselRescue] = useMutation(CRATEEVENTTYPE_VESSELRESCUE, {
        onCompleted: (response) => {
            const data = response.createEventType_VesselRescue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setUploadError("EventType_VesselRescues")
            setStorageItem('EventType_VesselRescues','error','','sync')
        },
    })
    const [UpdateEventType_VesselRescue] = useMutation(UPDATE_EVENTTYPE_VESSELRESCUE, {
        onCompleted: (response) => {
            const data = response.updateEventType_VesselRescue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setUploadError("EventType_VesselRescues")
            setStorageItem('EventType_VesselRescues','error','','sync')
        },
    })
    const [Get_EventTypeVessel_Rescue] = useLazyQuery(GET_EVENTTYPEVESSEL_RESCUE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_VesselRescue') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_VesselRescues_NoupdatedRecord!')
                                addSuccessResult('EventType_VesselRescues','sync')
                                setStorageItem('EventType_VesselRescues','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_VesselRescues','error','','sync')
                            setUploadError("EventType_VesselRescues")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setUploadError("EventType_VesselRescues")
            setStorageItem('EventType_VesselRescues','error','','sync')
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_EventTypeVessel_Rescue({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_VesselRescue
                    const updateData = {
                        address: record.address,
                        callSign: record.callSign,
                        cgMembershipType: record.cgMembershipType,
                        color: record.color,
                        email: record.email,
                        id: record.id,
                        latitude: record.latitude,
                        locationDescription: record.locationDescription,
                        missionID: record.missionID,
                        missionTimeline: record.missionTimeline,
                        operationType: record.operationType,
                        ownerName: record.ownerName,
                        ownerOnBoard: record.ownerOnBoard,
                        phone: record.phone,
                        pob: record.pob,
                        tripEventID: record.tripEventID,
                        vesselLength: record.vesselLength,
                        vesselLocationID: record.vesselLocationID,
                        vesselName: record.vesselName,
                        vesselType: record.vesselType,
                    }
                    const createData = {
                        address: record.address,
                        callSign: record.callSign,
                        cgMembership: record.cgMembership,
                        cgMembershipType: record.cgMembershipType,
                        color: record.color,
                        email: record.email,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        latitude: record.latitude,
                        locationDescription: record.locationDescription,
                        missionID: record.missionID,
                        missionTimeline: record.missionTimeline,
                        operationDescription: record.operationDescription,
                        operationType: record.operationType,
                        ownerName: record.ownerName,
                        phone: record.phone,
                        pob: record.pob,
                        tripEventID: record.tripEventID,
                        vesselLength: record.vesselLength,
                        vesselLocationID: record.vesselLocationID,
                        vesselName: record.vesselName,
                        vesselType: record.vesselType,

                    }
                    if(checkResult) {
                        UpdateEventType_VesselRescue({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_VesselRescue({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_VesselRescues")
                })
            })
        )
        addSuccessResult('EventType_VesselRescues','sync')
        setStorageItem('EventType_VesselRescues','success','100','sync')   
    }
    useEffect(() => {
        setStorageItem('EventType_VesselRescues','fetching','','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_VesselRescues
