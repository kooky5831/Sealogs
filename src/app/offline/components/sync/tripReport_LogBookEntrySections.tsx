import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TripReport_LogBookEntrySectionModel from '../../models/tripReport_LogBookEntrySection'
import { CREATE_TRIPREPORT_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_TRIPREPORT_LOGBOOKENTRYSECTION'
import { UPDATE_TRIPREPORT_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_TRIPREPORT_LOGBOOKENTRYSECTION'
import { GET_TRIPREPORT_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TRIPREPORT_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncTripReport_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new TripReport_LogBookEntrySectionModel()
    const [CreateTripReport_LogBookEntrySection] = useMutation(CREATE_TRIPREPORT_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createTripReport_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TripReport_LogBookEntrySections','error','','sync')
            setUploadError("TripReport_LogBookEntrySections")
        },
    })
    const [UpdateTripReport_LogBookEntrySection] = useMutation(UPDATE_TRIPREPORT_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateTripReport_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TripReport_LogBookEntrySections','error','','sync')
            setUploadError("TripReport_LogBookEntrySections")
        },
    })
    const [GetTripReportLogbookEntryId] = useLazyQuery(GET_TRIPREPORT_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TripReport_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TripReport_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('TripReport_LogBookEntrySections','sync')
                                setStorageItem('TripReport_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TripReport_LogBookEntrySections','error','','sync')
                            setUploadError("TripReport_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TripReport_LogBookEntrySections','error','','sync')
            setUploadError("TripReport_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                console.log('updatedRecord:',record)
                await GetTripReportLogbookEntryId({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTripReport_LogBookEntrySection
                    console.log('checkResult:',checkResult)
                    const tripReport_Stops =  record.tripReport_Stops.nodes.length > 0 && record.tripReport_Stops.nodes.map((node:any) => node.id) 
                    const tripEvents =  record.tripEvents.nodes.length > 0 && record.tripEvents.nodes.map((node:any) => node.id) 
                    const updateData = {
                        archived: record.archived,
                        arrive: record.arrive,
                        arriveTime: record.arriveTime,
                        arriveTo: record.arriveTo,
                        clientID: record.clientID,
                        comment: record.comment,
                        createdByID: record.createdByID,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        departFrom: record.departFrom,
                        departTime: record.departTime,
                        enableDGR: record.enableDGR,
                        expectedNextContact: record.expectedNextContact,
                        fromCreatesNewGeoLocation: record.fromCreatesNewGeoLocation,
                        fromFreehand: record.fromFreehand,
                        fromLat: record.fromLat,
                        fromLocationID: record.fromLocationID,
                        fromLong: record.fromLong,
                        hazardReports: record.hazardReports,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        lateDepartureReasonID: record.lateDepartureReasonID,
                        leadGuideID: record.leadGuideID,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        masterID: record.masterID,
                        numberPax: record.numberPax,
                        observedArrive: record.observedArrive,
                        observedDepart: record.observedDepart,
                        paxDeparted: record.paxDeparted,
                        paxJoinedAdult: record.paxJoinedAdult,
                        paxJoinedChild: record.paxJoinedChild,
                        paxJoinedFOC: record.paxJoinedFOC,
                        paxJoinedPrePaid: record.paxJoinedPrePaid,
                        paxJoinedStaff: record.paxJoinedStaff,
                        paxJoinedVoucher: record.paxJoinedVoucher,
                        paxJoinedYouth: record.paxJoinedYouth,
                        pob: record.pob,
                        positionLogs: record.positionLogs,
                        prevPaxState: record.prevPaxState,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        safetyBriefing: record.safetyBriefing,
                        safetyKayakerMembers: record.safetyKayakerMembers,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        speedExemption: record.speedExemption,
                        speedExemptionCorridorID: record.speedExemptionCorridorID,
                        speedExemptionReasonID: record.speedExemptionReasonID,
                        subView: record.subView,
                        tides: record.tides,
                        toCreatesNewGeoLocation: record.toCreatesNewGeoLocation,
                        toFreehand: record.toFreehand,
                        toLat: record.toLat,
                        toLocationID: record.toLocationID,
                        toLong: record.toLong,
                        totalVehiclesCarried: record.totalVehiclesCarried,
                        tripCrewMembers: record.tripCrewMembers,
                        tripEvents: record.tripEvents.nodes.length > 0 ? tripEvents.join(',') : null,
                        tripReportNotifications: record.tripReportNotifications,
                        tripReportScheduleID: record.tripReportScheduleID,
                        tripScheduleArriveTime: record.tripScheduleArriveTime,
                        tripScheduleDepartTime: record.tripScheduleDepartTime,
                        tripUpdateEntityID: record.tripUpdateEntityID,
                        unscheduledServiceID: record.unscheduledServiceID,
                        userDefinedData: record.userDefinedData,
                        vehiclesDeparted: record.vehiclesDeparted,
                        vehiclesJoined: record.vehiclesJoined,
                        vob: record.vob,
                        voucher: record.voucher,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        arrive: record.arrive,
                        arriveTime: record.arriveTime,
                        arriveTo: record.arriveTo,
                        clientID: record.clientID,
                        comment: record.comment,
                        createdByID: record.createdByID,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        departFrom: record.departFrom,
                        departTime: record.departTime,
                        enableDGR: record.enableDGR,
                        expectedNextContact: record.expectedNextContact,
                        fromCreatesNewGeoLocation: record.fromCreatesNewGeoLocation,
                        fromFreehand: record.fromFreehand,
                        fromLat: record.fromLat,
                        fromLocationID: record.fromLocationID,
                        fromLong: record.fromLong,
                        hazardReports: record.hazardReports,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        incidentReports: record.incidentReports,
                        lateDepartureReasonID: record.lateDepartureReasonID,
                        leadGuideID: record.leadGuideID,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        masterID: record.masterID,
                        numberPax: record.numberPax,
                        observedArrive: record.observedArrive,
                        observedDepart: record.observedDepart,
                        paxDeparted: record.paxDeparted,
                        paxJoinedAdult: record.paxJoinedAdult,
                        paxJoinedChild: record.paxJoinedChild,
                        paxJoinedFOC: record.paxJoinedFOC,
                        paxJoinedPrePaid: record.paxJoinedPrePaid,
                        paxJoinedStaff: record.paxJoinedStaff,
                        paxJoinedVoucher: record.paxJoinedVoucher,
                        paxJoinedYouth: record.paxJoinedYouth,
                        pob: record.pob,
                        prevPaxState: record.prevPaxState,
                        riverFlowID: record.riverFlowID,
                        safetyBriefing: record.safetyBriefing,
                        safetyKayakerMembers: record.safetyKayakerMembers,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        speedExemption: record.speedExemption,
                        speedExemptionCorridorID: record.speedExemptionCorridorID,
                        speedExemptionReasonID: record.speedExemptionReasonID,
                        subView: record.subView,
                        tides: record.tides,
                        toCreatesNewGeoLocation: record.toCreatesNewGeoLocation,
                        toFreehand: record.toFreehand,
                        toLat: record.toLat,
                        toLocationID: record.toLocationID,
                        toLong: record.toLong,
                        totalVehiclesCarried: record.totalVehiclesCarried,
                        tripCrewMembers: record.tripCrewMembers,
                        tripEvents: record.tripEvents.nodes.length > 0 ? tripEvents.join(',') : null,
                        tripReportNotifications: record.tripReportNotifications,
                        tripReportScheduleID: record.tripReportScheduleID,
                        tripReport_Stops: record.tripReport_Stops.nodes.length > 0 ? tripReport_Stops.join(',') : null,
                        tripScheduleArriveTime: record.tripScheduleArriveTime,
                        tripScheduleDepartTime: record.tripScheduleDepartTime,
                        tripUpdateEntityID: record.tripUpdateEntityID,
                        unscheduledServiceID: record.unscheduledServiceID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        vehiclesDeparted: record.vehiclesDeparted,
                        vehiclesJoined: record.vehiclesJoined,
                        vob: record.vob,
                        voucher: record.voucher,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdateTripReport_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTripReport_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TripReport_LogBookEntrySections")
                })
            })
        )
        setStorageItem('TripReport_LogBookEntrySections','success','100','sync')
        addSuccessResult('TripReport_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('TripReport_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTripReport_LogBookEntrySections
