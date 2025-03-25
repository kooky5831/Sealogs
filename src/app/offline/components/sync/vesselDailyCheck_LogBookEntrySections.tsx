import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    addSuccessResult,
    setStorageItem,
    setUploadError,
} from '../../helpers/functions'
import VesselDailyCheck_LogBookEntrySectionModel from '../../models/vesselDailyCheck_LogBookEntrySection'
import { CREATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION'
import { UPDATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION'
import { GET_VESSELDAILYCHECK_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_VESSELDAILYCHECK_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncVesselDailyCheck_LogBookEntrySections: React.FC<{ flag: string }> =
    React.memo(({ flag }) => {
        const model = new VesselDailyCheck_LogBookEntrySectionModel()
        const [CreateVesselDailyCheck_LogBookEntrySection] = useMutation(
            CREATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION,
            {
                onCompleted: (response) => {
                    const data =
                        response.createVesselDailyCheck_LogBookEntrySection
                    if (typeof window !== 'undefined' && data) {
                        model.setProperty(data.id)
                    }
                },
                onError: (error) => {
                    console.log('createError:', error)
                    setStorageItem('VesselDailyCheck_LogBookEntrySections','error','','sync')
                    setUploadError('VesselDailyCheck_LogBookEntrySections')
                },
            },
        )
        const [UpdateVesselDailyCheck_LogBookEntrySection] = useMutation(
            UPDATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION,
            {
                onCompleted: (response) => {
                    const data =
                        response.updateVesselDailyCheck_LogBookEntrySection
                    if (typeof window !== 'undefined' && data) {
                        model.setProperty(data.id)
                    }
                },
                onError: (error) => {
                    console.log('updateError:', error)
                    setStorageItem('VesselDailyCheck_LogBookEntrySections','error','','sync')
                    setUploadError('VesselDailyCheck_LogBookEntrySections')
                },
            },
        )
        const [GetVesselDailyCheckLogbookEntrySectionById] = useLazyQuery(
            GET_VESSELDAILYCHECK_LOGBOOKENTRYSECTION_BY_ID,
            {
                fetchPolicy: 'cache-and-network',
            },
        )
        const getUpdatedRecord = () => {
            try {
                db.tables.map(async (table) => {
                    if (table.name == 'VesselDailyCheck_LogBookEntrySection') {
                        await table
                            .where('idbCRUD')
                            .equals('Update')
                            .toArray()
                            .then((result) => {
                                if (result.length > 0) {
                                    uploadRecordToServer(result)
                                } else {
                                    console.log(
                                        'VesselDailyCheck_LogBookEntrySections_NoupdatedRecord!',
                                    )
                                    addSuccessResult(
                                        'VesselDailyCheck_LogBookEntrySections',
                                        'sync',
                                    )
                                    setStorageItem(
                                        'VesselDailyCheck_LogBookEntrySections',
                                        'success',
                                        '100',
                                        'sync',
                                    )
                                }
                            })
                            .catch((err) => {
                                console.log("read record Error:",table.name)
                                setStorageItem('VesselDailyCheck_LogBookEntrySections','error','','sync')
                                setUploadError('VesselDailyCheck_LogBookEntrySections')});
                    }
                })
            } catch (error) {
                console.error('Error retrieving records:', error)
                setStorageItem('VesselDailyCheck_LogBookEntrySections','error','','sync')
                setUploadError('VesselDailyCheck_LogBookEntrySections')
            }
        }
        const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
            //check record existing in server
            await Promise.all(
                updatedRecord.map(async (record: any) => {
                    const id = record.id
                    await GetVesselDailyCheckLogbookEntrySectionById({
                        variables: {
                            id: id,
                        },
                    })
                        .then((res) => {
                            const checkResult = res.data.readOneVesselDailyCheck_LogBookEntrySection
                            const crewResponsible = record.crewResponsible.nodes.length > 0 && record.crewResponsible.nodes.map((node: any) => node.id)
                            const updateData = {
                                archived: record.archived,
                                batteries: record.batteries,
                                batteryIsCharging: record.batteryIsCharging,
                                beltsHosesClamps: record.beltsHosesClamps,
                                bilgeCheck: record.bilgeCheck,
                                bilgeLevels: record.bilgeLevels,
                                bilgePumps: record.bilgePumps,
                                bungsInPlace: record.bungsInPlace,
                                cabin: record.cabin,
                                chartPlotter: record.chartPlotter,
                                charts: record.charts,
                                checkOilPressure: record.checkOilPressure,
                                checkTime: record.checkTime,
                                checksWithManual: record.checksWithManual,
                                clientID: record.clientID,
                                compass: record.compass,
                                coolantLevels: record.coolantLevels,
                                cooling: record.cooling,
                                cotterPins: record.cotterPins,
                                createdByID: record.createdByID,
                                crewResponsible: record.crewResponsible.nodes.length > 0 ? crewResponsible.join(',') : null,
                                dayShapes: record.dayShapes,
                                depthSounder: record.depthSounder,
                                driveShafts: record.driveShafts,
                                driveShaftsChecks: record.driveShaftsChecks,
                                electrical: record.electrical,
                                electricalChecks: record.electricalChecks,
                                electricalVisualFields:
                                    record.electricalVisualFields,
                                electronics: record.electronics,
                                engineCheckPropellers: record.engineCheckPropellers,
                                engineChecks: record.engineChecks,
                                engineIsFit: record.engineIsFit,
                                engineMounts: record.engineMounts,
                                engineMountsAndStabilisers:
                                    record.engineMountsAndStabilisers,
                                engineOil: record.engineOil,
                                engineOilWater: record.engineOilWater,
                                engineRoom: record.engineRoom,
                                engineRoomChecks: record.engineRoomChecks,
                                engineRoomVisualInspection:
                                    record.engineRoomVisualInspection,
                                engineTellTale: record.engineTellTale,
                                epirb: record.epirb,
                                exhaust: record.exhaust,
                                exterior: record.exterior,
                                fireAxes: record.fireAxes,
                                fireBlanket: record.fireBlanket,
                                fireBuckets: record.fireBuckets,
                                fireDampeners: record.fireDampeners,
                                fireExtinguisher: record.fireExtinguisher,
                                fireFlaps: record.fireFlaps,
                                fireHoses: record.fireHoses,
                                firePump: record.firePump,
                                firstAid: record.firstAid,
                                flares: record.flares,
                                floor: record.floor,
                                forwardAndReverse: record.forwardAndReverse,
                                forwardAndReverseBelts:
                                    record.forwardAndReverseBelts,
                                forwardReverse: record.forwardReverse,
                                freshWater: record.freshWater,
                                fuel: record.fuel,
                                fuelFilters: record.fuelFilters,
                                fuelLevel: record.fuelLevel,
                                fuelShutoffs: record.fuelShutoffs,
                                fuelSystems: record.fuelSystems,
                                fuelTanks: record.fuelTanks,
                                gearBox: record.gearBox,
                                generator: record.generator,
                                gps: record.gps,
                                hatches: record.hatches,
                                hazardousSubstanceRecords:
                                    record.hazardousSubstanceRecords,
                                highWaterAlarm: record.highWaterAlarm,
                                houseBatteriesStatus: record.houseBatteriesStatus,
                                hull: record.hull,
                                hullStructure: record.hullStructure,
                                hull_DeckEquipment: record.hull_DeckEquipment,
                                hull_HullStructure: record.hull_HullStructure,
                                hvac: record.hvac,
                                id: record.id,
                                interior: record.interior,
                                jetUnit: record.jetUnit,
                                lifeJackets: record.lifeJackets,
                                lifeRaft: record.lifeRaft,
                                lifeRings: record.lifeRings,
                                lockToLockSteering: record.lockToLockSteering,
                                logBookEntryID: record.logBookEntryID,
                                mainEngineChecks: record.mainEngineChecks,
                                masterID: record.masterID,
                                navEquipment: record.navEquipment,
                                navigationCharts: record.navigationCharts,
                                navigationChecks: record.navigationChecks,
                                navigationHazards: record.navigationHazards,
                                navigationLights: record.navigationLights,
                                nightLineDockLinesRelease:
                                    record.nightLineDockLinesRelease,
                                nozzleAndBearings: record.nozzleAndBearings,
                                oilAndWater: record.oilAndWater,
                                oilWater: record.oilWater,
                                operationalTestsOfHelms:
                                    record.operationalTestsOfHelms,
                                otherEngineFields: record.otherEngineFields,
                                otherNavigation: record.otherNavigation,
                                personOverboardRescueEquipment:
                                    record.personOverboardRescueEquipment,
                                pestControl: record.pestControl,
                                pontoonPressure: record.pontoonPressure,
                                postElectrical: record.postElectrical,
                                postElectricalStrainers:
                                    record.postElectricalStrainers,
                                postEngineAndPropulsion:
                                    record.postEngineAndPropulsion,
                                postStartupChecks: record.postStartupChecks,
                                postStartupEngineChecks:
                                    record.postStartupEngineChecks,
                                preEngineAndPropulsion:
                                    record.preEngineAndPropulsion,
                                preFuelLevelEnd: record.preFuelLevelEnd,
                                preFuelLevelStart: record.preFuelLevelStart,
                                preStartupChecks: record.preStartupChecks,
                                propellers: record.propellers,
                                propulsion: record.propulsion,
                                propulsionBatteriesStatus:
                                    record.propulsionBatteriesStatus,
                                propulsionCheck: record.propulsionCheck,
                                propulsionEngineChecks:
                                    record.propulsionEngineChecks,
                                propulsionPropulsion: record.propulsionPropulsion,
                                radar: record.radar,
                                radio: record.radio,
                                radioCommunications: record.radioCommunications,
                                recordComments: record.recordComments,
                                reverseBucketAndRam: record.reverseBucketAndRam,
                                riverFlowID: record.riverFlowID,
                                safetyEquipment: record.safetyEquipment,
                                sail: record.sail,
                                sandTraps: record.sandTraps,
                                sanitation: record.sanitation,
                                sart: record.sart,
                                seaStrainers: record.seaStrainers,
                                sectionSignatureID: record.sectionSignatureID,
                                sewage: record.sewage,
                                shorePower: record.shorePower,
                                shorePowerIsDisconnected:
                                    record.shorePowerIsDisconnected,
                                skeg: record.skeg,
                                smokeDetectors: record.smokeDetectors,
                                sortOrder: record.sortOrder,
                                stabilizers: record.stabilizers,
                                steering: record.steering,
                                steeringFluid: record.steeringFluid,
                                steeringIsFit: record.steeringIsFit,
                                steeringPropultion: record.steeringPropultion,
                                steeringRams: record.steeringRams,
                                steeringRudders: record.steeringRudders,
                                steeringTiller: record.steeringTiller,
                                steeringTillers: record.steeringTillers,
                                subView: record.subView,
                                swell: record.swell,
                                swimPlatformLadder: record.swimPlatformLadder,
                                tailHousing: record.tailHousing,
                                tenderOperationalChecks:
                                    record.tenderOperationalChecks,
                                throttle: record.throttle,
                                throttleAndCable: record.throttleAndCable,
                                throttleAndCableChecks:
                                    record.throttleAndCableChecks,
                                tides: record.tides,
                                tracPlus: record.tracPlus,
                                transmission: record.transmission,
                                trimTabs: record.trimTabs,
                                tripEvents: record.tripEvents,
                                tv: record.tv,
                                uhf: record.uhf,
                                uniqueID: record.uniqueID,
                                unitTransomBolts: record.unitTransomBolts,
                                userDefinedData: record.userDefinedData,
                                vehicleDrivers: record.vehicleDrivers,
                                vhf: record.vhf,
                                weatherReports: record.weatherReports,
                                weatherSummary: record.weatherSummary,
                                wheelhouse: record.wheelhouse,
                                windDirection: record.windDirection,
                                windStrength: record.windStrength,
                                windscreenCheck: record.windscreenCheck,
                                wiring: record.wiring,
                            }
                            const createData = {
                                airShutoffs: record.airShutoffs,
                                aisOperational: record.aisOperational,
                                anchor: record.anchor,
                                archived: record.archived,
                                batteries: record.batteries,
                                batteryIsCharging: record.batteryIsCharging,
                                beltsHosesClamps: record.beltsHosesClamps,
                                bilge: record.bilge,
                                bilgeCheck: record.bilgeCheck,
                                bilgeLevels: record.bilgeLevels,
                                bilgePumps: record.bilgePumps,
                                biminiTopsCanvasCovers:
                                    record.biminiTopsCanvasCovers,
                                bungsInPlace: record.bungsInPlace,
                                cabin: record.cabin,
                                cablesFRPullies: record.cablesFRPullies,
                                chartPlotter: record.chartPlotter,
                                charts: record.charts,
                                checkOilPressure: record.checkOilPressure,
                                checkTime: record.checkTime,
                                checksWithManual: record.checksWithManual,
                                clientID: record.clientID,
                                compass: record.compass,
                                coolantLevels: record.coolantLevels,
                                cooling: record.cooling,
                                cotterPins: record.cotterPins,
                                createdByID: record.createdByID,
                                crewResponsible: record.crewResponsible.nodes.length > 0 ? crewResponsible.join(',') : null,
                                dayShapes: record.dayShapes,
                                deckEquipment: record.deckEquipment,
                                depthSounder: record.depthSounder,
                                documentCrewBriefings: record.documentCrewBriefings,
                                driveShafts: record.driveShafts,
                                driveShaftsChecks: record.driveShaftsChecks,
                                electrical: record.electrical,
                                electricalChecks: record.electricalChecks,
                                electricalPanels: record.electricalPanels,
                                electricalVisualFields:
                                    record.electricalVisualFields,
                                electronics: record.electronics,
                                engineCheckPropellers: record.engineCheckPropellers,
                                engineChecks: record.engineChecks,
                                engineIsFit: record.engineIsFit,
                                engineMounts: record.engineMounts,
                                engineMountsAndStabilisers:
                                    record.engineMountsAndStabilisers,
                                engineOil: record.engineOil,
                                engineOilWater: record.engineOilWater,
                                engineRoom: record.engineRoom,
                                engineRoomChecks: record.engineRoomChecks,
                                engineRoomVisualInspection:
                                    record.engineRoomVisualInspection,
                                engineTellTale: record.engineTellTale,
                                epirb: record.epirb,
                                exhaust: record.exhaust,
                                exterior: record.exterior,
                                fileTracking: record.fileTracking,
                                fireAxes: record.fireAxes,
                                fireBlanket: record.fireBlanket,
                                fireBuckets: record.fireBuckets,
                                fireDampeners: record.fireDampeners,
                                fireExtinguisher: record.fireExtinguisher,
                                fireFlaps: record.fireFlaps,
                                fireHoses: record.fireHoses,
                                firePump: record.firePump,
                                firstAid: record.firstAid,
                                flares: record.flares,
                                floor: record.floor,
                                forwardAndReverse: record.forwardAndReverse,
                                forwardAndReverseBelts:
                                    record.forwardAndReverseBelts,
                                forwardReverse: record.forwardReverse,
                                freshWater: record.freshWater,
                                fuel: record.fuel,
                                fuelFilters: record.fuelFilters,
                                fuelLevel: record.fuelLevel,
                                fuelShutoffs: record.fuelShutoffs,
                                fuelSystems: record.fuelSystems,
                                fuelTanks: record.fuelTanks,
                                gearBox: record.gearBox,
                                generator: record.generator,
                                gps: record.gps,
                                hatches: record.hatches,
                                hazardousSubstanceRecords:
                                    record.hazardousSubstanceRecords,
                                highWaterAlarm: record.highWaterAlarm,
                                houseBatteriesStatus: record.houseBatteriesStatus,
                                hull: record.hull,
                                hullStructure: record.hullStructure,
                                hull_DeckEquipment: record.hull_DeckEquipment,
                                hull_HullStructure: record.hull_HullStructure,
                                hvac: record.hvac,
                                id: record.id,
                                interior: record.interior,
                                jetUnit: record.jetUnit,
                                lastEdited: record.lastEdited,
                                lifeJackets: record.lifeJackets,
                                lifeRaft: record.lifeRaft,
                                lifeRings: record.lifeRings,
                                lockToLockSteering: record.lockToLockSteering,
                                logBookComponentClass: record.logBookComponentClass,
                                logBookEntryID: record.logBookEntryID,
                                mainEngine: record.mainEngine,
                                mainEngineChecks: record.mainEngineChecks,
                                masterID: record.masterID,
                                navEquipment: record.navEquipment,
                                navigationCharts: record.navigationCharts,
                                navigationChecks: record.navigationChecks,
                                navigationHazards: record.navigationHazards,
                                navigationLights: record.navigationLights,
                                nightLineDockLinesRelease:
                                    record.nightLineDockLinesRelease,
                                nozzleAndBearings: record.nozzleAndBearings,
                                oilAndWater: record.oilAndWater,
                                oilWater: record.oilWater,
                                operationalTestsOfHelms:
                                    record.operationalTestsOfHelms,
                                otherEngineFields: record.otherEngineFields,
                                otherNavigation: record.otherNavigation,
                                personOverboardRescueEquipment:
                                    record.personOverboardRescueEquipment,
                                pestControl: record.pestControl,
                                pontoonPressure: record.pontoonPressure,
                                postElectrical: record.postElectrical,
                                postElectricalStrainers:
                                    record.postElectricalStrainers,
                                postEngineAndPropulsion:
                                    record.postEngineAndPropulsion,
                                postStartupChecks: record.postStartupChecks,
                                postStartupEngineChecks:
                                    record.postStartupEngineChecks,
                                preEngineAndPropulsion:
                                    record.preEngineAndPropulsion,
                                preFuelLevelEnd: record.preFuelLevelEnd,
                                preFuelLevelStart: record.preFuelLevelStart,
                                preStartupChecks: record.preStartupChecks,
                                propellers: record.propellers,
                                propulsion: record.propulsion,
                                propulsionBatteriesStatus:
                                    record.propulsionBatteriesStatus,
                                propulsionCheck: record.propulsionCheck,
                                propulsionEngineChecks:
                                    record.propulsionEngineChecks,
                                propulsionPropulsion: record.propulsionPropulsion,
                                radar: record.radar,
                                radio: record.radio,
                                radioCommunications: record.radioCommunications,
                                recordComments: record.recordComments,
                                reverseBucketAndRam: record.reverseBucketAndRam,
                                riverFlowID: record.riverFlowID,
                                safetyEquipment: record.safetyEquipment,
                                sail: record.sail,
                                sandTraps: record.sandTraps,
                                sanitation: record.sanitation,
                                sart: record.sart,
                                seaStrainers: record.seaStrainers,
                                sectionMemberComments: record.sectionMemberComments,
                                sectionSignatureID: record.sectionSignatureID,
                                separators: record.separators,
                                sewage: record.sewage,
                                shorePower: record.shorePower,
                                shorePowerIsDisconnected:
                                    record.shorePowerIsDisconnected,
                                skeg: record.skeg,
                                smokeDetectors: record.smokeDetectors,
                                sortOrder: record.sortOrder,
                                soundSignallingDevices:
                                    record.soundSignallingDevices,
                                stabilizationSystems: record.stabilizationSystems,
                                stabilizers: record.stabilizers,
                                steering: record.steering,
                                steeringChecks: record.steeringChecks,
                                steeringFluid: record.steeringFluid,
                                steeringHoses: record.steeringHoses,
                                steeringHydraulicSystems:
                                    record.steeringHydraulicSystems,
                                steeringIsFit: record.steeringIsFit,
                                steeringPropultion: record.steeringPropultion,
                                steeringRams: record.steeringRams,
                                steeringRudders: record.steeringRudders,
                                steeringTiller: record.steeringTiller,
                                steeringTillers: record.steeringTillers,
                                subView: record.subView,
                                swell: record.swell,
                                swimPlatformLadder: record.swimPlatformLadder,
                                tailHousing: record.tailHousing,
                                tenderOperationalChecks:
                                    record.tenderOperationalChecks,
                                throttle: record.throttle,
                                throttleAndCable: record.throttleAndCable,
                                throttleAndCableChecks:
                                    record.throttleAndCableChecks,
                                tides: record.tides,
                                tracPlus: record.tracPlus,
                                transmission: record.transmission,
                                trimTabs: record.trimTabs,
                                tripEvents: record.tripEvents,
                                tv: record.tv,
                                uhf: record.uhf,
                                unitTransomBolts: record.unitTransomBolts,
                                userDefinedData: record.userDefinedData,
                                vehicleDrivers: record.vehicleDrivers,
                                vhf: record.vhf,
                                weatherReports: record.weatherReports,
                                weatherSummary: record.weatherSummary,
                                wheelhouse: record.wheelhouse,
                                windDirection: record.windDirection,
                                windStrength: record.windStrength,
                                windscreenCheck: record.windscreenCheck,
                                wiring: record.wiring,
                            }
                            if (checkResult) {
                                UpdateVesselDailyCheck_LogBookEntrySection({
                                    variables: {
                                        input: updateData,
                                    },
                                })
                            } else {
                                CreateVesselDailyCheck_LogBookEntrySection({
                                    variables: {
                                        input: createData,
                                    },
                                })
                            }
                        })
                        .catch((err) => {
                            console.log('checkRecordError:', err)
                            setUploadError('VesselDailyCheck_LogBookEntrySections')
                        })
                })
            )
            setStorageItem(
                'VesselDailyCheck_LogBookEntrySections',
                'success',
                '100',
                'sync',
            )
            addSuccessResult(
                'VesselDailyCheck_LogBookEntrySections',
                'sync',
            )
        }
        useEffect(() => {
            setStorageItem('VesselDailyCheck_LogBookEntrySections','fetching','0','sync')
            getUpdatedRecord()
        }, [flag])

        return <div></div>
    })
export default SyncVesselDailyCheck_LogBookEntrySections
