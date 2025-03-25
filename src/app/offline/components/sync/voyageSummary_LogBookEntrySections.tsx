import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import VoyageSummary_LogBookEntrySectionModel from '../../models/voyageSummary_LogBookEntrySection'
import { CREATE_VOYAGESUMMARY_LOGBOOKENTRYSECTOIN } from '@/app/lib/graphQL/mutation/offline/CREATE_VOYAGESUMMARY_LOGBOOKENTRYSECTOIN'
import { UPDATE_VOYAGESUMMARY_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_VOYAGESUMMARY_LOGBOOKENTRYSECTION'
import { GET_VOYAGESUMMARY_LOGBBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_VOYAGESUMMARY_LOGBBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncVoyageSummary_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new VoyageSummary_LogBookEntrySectionModel()
    const [CreateVoyageSummary_LogBookEntrySection] = useMutation(CREATE_VOYAGESUMMARY_LOGBOOKENTRYSECTOIN, {
        onCompleted: (response) => {
            const data = response.createVoyageSummary_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('VoyageSummary_LogBookEntrySections','error','','sync')
            setUploadError("VoyageSummary_LogBookEntrySections")
        },
    })
    const [UpdateVoyageSummary_LogBookEntrySection] = useMutation(UPDATE_VOYAGESUMMARY_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateVoyageSummary_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('VoyageSummary_LogBookEntrySections','error','','sync')
            setUploadError("VoyageSummary_LogBookEntrySections")
        },
    })
    const [GetVoyageSummaryLogbookEntrySectionById] = useLazyQuery(GET_VOYAGESUMMARY_LOGBBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'VoyageSummary_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('VoyageSummary_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('VoyageSummary_LogBookEntrySections','sync')
                                setStorageItem('VoyageSummary_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('VoyageSummary_LogBookEntrySections','error','','sync')
                            setUploadError("VoyageSummary_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('VoyageSummary_LogBookEntrySections','error','','sync')
            setUploadError("VoyageSummary_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetVoyageSummaryLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneVoyageSummary_LogBookEntrySection
                    const tripEvents = record.tripEvents.nodes.length > 0 && record.tripEvents.nodes.map((node: any) => node.id)
                    const updateData = {
                        activities: record.activities,
                        archived: record.archived,
                        clientID: record.clientID,
                        courseSteered: record.courseSteered,
                        createdByID: record.createdByID,
                        forecastComment: record.forecastComment,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        oktas: record.oktas,
                        precipitation: record.precipitation,
                        riverFlowID: record.riverFlowID,
                        seaState: record.seaState,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        speedOverGround: record.speedOverGround,
                        subView: record.subView,
                        swell: record.swell,
                        tides: record.tides,
                        tripEvents: record.tripEvents.nodes.length > 0 ? tripEvents.join(',') : null,
                        typeOfSteering: record.typeOfSteering,
                        uniqueID: record.uniqueID,
                        vesselRPM: record.vesselRPM,
                        visibility: record.visibility,
                        windDirection: record.windDirection,
                        windStrength: record.windStrength,
                    }
                    const createData = {
                        activities: record.activities,
                        archived: record.archived,
                        changesToPlan: record.changesToPlan,
                        clientID: record.clientID,
                        courseOverGround: record.courseOverGround,
                        courseSteered: record.courseSteered,
                        createdByID: record.createdByID,
                        forecastComment: record.forecastComment,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        oktas: record.oktas,
                        precipitation: record.precipitation,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        seaState: record.seaState,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        speedOverGround: record.speedOverGround,
                        subView: record.subView,
                        swell: record.swell,
                        tides: record.tides,
                        typeOfSteering: record.typeOfSteering,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vesselRPM: record.vesselRPM,
                        voyageDistance: record.voyageDistance,
                        weatherComments: record.weatherComments,
                        windDirection: record.windDirection,
                        windStrength: record.windStrength,
                    }
                    if(checkResult) {
                        UpdateVoyageSummary_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateVoyageSummary_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CreateVoyageSummary_LogBookEntrySection")
                })
            })
        )
        setStorageItem('VoyageSummary_LogBookEntrySections','success','100','sync')
        addSuccessResult('VoyageSummary_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('VoyageSummary_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncVoyageSummary_LogBookEntrySections
