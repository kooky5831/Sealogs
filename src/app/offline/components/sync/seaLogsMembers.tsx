import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    addSuccessResult,
    setStorageItem,
    setUploadError,
} from '../../helpers/functions'
import { CREATE_USER, UPDATE_USER } from '@/app/lib/graphQL/mutation'
import SeaLogsMemberModel from '../../models/seaLogsMember'
import { GET_SEALOGSMEMBER_BY_ID } from '@/app/lib/graphQL/query/offline/GET_SEALOGSMEMBER_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncSeaLogsMembers: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
        const model = new SeaLogsMemberModel()
        const [CreateSeaLogsMember] = useMutation(CREATE_USER, {
            onCompleted: (response) => {
                const data = response.createSeaLogsMember
                if (typeof window !== 'undefined' && data) {
                    model.setProperty(data.id)
                }
            },
            onError: (error) => {
                console.log('createError:', error)
                setStorageItem('SeaLogsMembers', 'error', '', 'sync')
                setUploadError('SeaLogsMembers')
            },
        })
        const [UpdateSeaLogsMember] = useMutation(UPDATE_USER, {
            onCompleted: (response) => {
                const data = response.updateSeaLogsMember
                if (typeof window !== 'undefined' && data) {
                    model.setProperty(data.id)
                }
            },
            onError: (error) => {
                console.log('updateError:', error)
                setStorageItem('SeaLogsMembers', 'error', '', 'sync')
                setUploadError('SeaLogsMembers')
            },
        })
        const [GetSeaLogsMemberById] = useLazyQuery(GET_SEALOGSMEMBER_BY_ID, {
            fetchPolicy: 'cache-and-network',
        })
        const getUpdatedRecord = () => {
            try {
                db.tables.map(async (table) => {
                    if (table.name == 'SeaLogsMember') {
                        await table
                            .where('idbCRUD')
                            .equals('Update')
                            .toArray()
                            .then((result) => {
                                if (result.length > 0) {
                                    uploadRecordToServer(result)
                                } else {
                                    console.log(
                                        'SeaLogsMembers_NoupdatedRecord!',
                                    )
                                    addSuccessResult('SeaLogsMembers', 'sync')
                                    setStorageItem('SeaLogsMembers', 'success', '100', 'sync')
                                }
                            })
                            .catch((err) => {
                                console.log("read record Error:",table.name)
                                setStorageItem('SeaLogsMembers', 'error', '', 'sync')
                                setUploadError('SeaLogsMembers')
                            });
                    }
                })
            } catch (error) {
                console.error('Error retrieving records:', error)
                setStorageItem('SeaLogsMembers', 'error', '', 'sync')
                setUploadError('SeaLogsMembers')
            }
        }
        const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
            //check record existing in server
            await Promise.all(
                updatedRecord.map(async (record: any) => {
                    const id = record.id
                    await GetSeaLogsMemberById({
                        variables: {
                            id: id,
                        },
                    })
                        .then((res) => {
                            const checkResult = res.data.readOneSeaLogsMember
                            const vehicles = record.vehicles.nodes && record.vehicles.nodes.map((node: any) => node.id);
                            const trainingSessions =  record.trainingSessions.nodes && record.trainingSessions.nodes.map((node:any) => node.id)
                            const trainingSessionsDue = record.trainingSessionsDue.nodes && record.trainingSessionsDue.nodes.map((node:any) => node.id)
                            const createData = {
                                accountResetExpired: record.accountResetExpired,
                                accountResetHash: record.accountResetHash,
                                alternatePhoneNumber: record.alternatePhoneNumber,
                                archived: record.archived,
                                authTokens: record.authTokens,
                                autoLoginExpired: record.autoLoginExpired,
                                autoLoginHash: record.autoLoginHash,
                                availableOnAllVessels: record.availableOnAllVessels,
                                className: record.className,
                                clientID: record.clientID,
                                componentMaintenanceChecks:
                                    record.componentMaintenanceChecks,
                                created: record.created,
                                crewMembers_LogBookEntrySections:
                                    record.crewMembers_LogBookEntrySections,
                                crewTraining_LogBookEntrySections:
                                    record.crewTraining_LogBookEntrySections,
                                currentDepartmentID: record.currentDepartmentID,
                                currentVehicleID: record.currentVehicleID,
                                dailyCheck: record.dailyCheck,
                                dashboardAllActiveVessels:
                                    record.dashboardAllActiveVessels,
                                dashboardTripReports: record.dashboardTripReports,
                                dashboardVessels: record.dashboardVessels,
                                defaultRegisteredMethodID:
                                    record.defaultRegisteredMethodID,
                                departments: record.departments,
                                documents: record.documents,
                                email: record.email,
                                failedLoginCount: record.failedLoginCount,
                                fileTracking: record.fileTracking,
                                firstName: record.firstName,
                                groups: record.groups,
                                hasSkippedMFARegistration:
                                    record.hasSkippedMFARegistration,
                                id: record.id,
                                isCrew: record.isCrew,
                                isMaster: record.isMaster,
                                isPilot: record.isPilot,
                                isTransferee: record.isTransferee,
                                lastEdited: record.lastEdited,
                                locale: record.locale,
                                lockedOutUntil: record.lockedOutUntil,
                                logBookEntries: record.logBookEntries,
                                logBookEntrySections: record.logBookEntrySections,
                                loggedPasswords: record.loggedPasswords,
                                loginSessions: record.loginSessions,
                                memberCertChecks: record.memberCertChecks,
                                memberNotifications: record.memberNotifications,
                                needsApproval: record.needsApproval,
                                needsValidation: record.needsValidation,
                                notRealPerson: record.notRealPerson,
                                otherActivities: record.otherActivities,
                                password: record.password,
                                passwordEncryption: record.passwordEncryption,
                                passwordExpiry: record.passwordExpiry,
                                phoneNumber: record.phoneNumber,
                                pin: record.pin,
                                primaryDutyID: record.primaryDutyID,
                                profilePageID: record.profilePageID,
                                publicFieldsRaw: record.publicFieldsRaw,
                                registeredMFAMethods: record.registeredMFAMethods,
                                rememberLoginHashes: record.rememberLoginHashes,
                                requireMFA: record.requireMFA,
                                resetTokenID: record.resetTokenID,
                                safetyKayakerMembers: record.safetyKayakerMembers,
                                salt: record.salt,
                                seaLogsTheme: record.seaLogsTheme,
                                signupTokenID: record.signupTokenID,
                                superAdmin: record.superAdmin,
                                surname: record.surname,
                                tempIDExpired: record.tempIDExpired,
                                tempIDHash: record.tempIDHash,
                                trainingSessions: trainingSessions.join(','),
                                trainingSessionsDue: trainingSessionsDue.join(','),
                                tripCrewMembers: record.tripCrewMembers,
                                username: record.username,
                                validationKey: record.validationKey,
                                vehicles: vehicles.join(','),
                                viewArchivedMode: record.viewArchivedMode,
                            }
                            const updateData = {
                                accountResetExpired: record.accountResetExpired,
                                accountResetHash: record.accountResetHash,
                                alternatePhoneNumber: record.alternatePhoneNumber,
                                archived: record.archived,
                                authTokens: record.authTokens,
                                autoLoginExpired: record.autoLoginExpired,
                                autoLoginHash: record.autoLoginHash,
                                availableOnAllVessels: record.availableOnAllVessels,
                                className: record.className,
                                clientID: record.clientID,
                                componentMaintenanceChecks:
                                    record.componentMaintenanceChecks,
                                created: record.created,
                                crewMembers_LogBookEntrySections:
                                    record.crewMembers_LogBookEntrySections,
                                crewTraining_LogBookEntrySections:
                                    record.crewTraining_LogBookEntrySections,
                                currentDepartmentID: record.currentDepartmentID,
                                currentVehicleID: record.currentVehicleID,
                                dailyCheck: record.dailyCheck,
                                dashboardAllActiveVessels:
                                    record.dashboardAllActiveVessels,
                                dashboardTripReports: record.dashboardTripReports,
                                dashboardVessels: record.dashboardVessels,
                                defaultRegisteredMethodID:
                                    record.defaultRegisteredMethodID,
                                departments: record.departments,
                                documents: record.documents,
                                email: record.email,
                                failedLoginCount: record.failedLoginCount,
                                fileTracking: record.fileTracking,
                                firstName: record.firstName,
                                groups: record.groups,
                                hasSkippedMFARegistration:
                                    record.hasSkippedMFARegistration,
                                id: record.id,
                                isCrew: record.isCrew,
                                isMaster: record.isMaster,
                                isPilot: record.isPilot,
                                isTransferee: record.isTransferee,
                                lastEdited: record.lastEdited,
                                locale: record.locale,
                                lockedOutUntil: record.lockedOutUntil,
                                logBookEntries: record.logBookEntries,
                                logBookEntrySections: record.logBookEntrySections,
                                loggedPasswords: record.loggedPasswords,
                                loginSessions: record.loginSessions,
                                memberCertChecks: record.memberCertChecks,
                                memberNotifications: record.memberNotifications,
                                needsApproval: record.needsApproval,
                                needsValidation: record.needsValidation,
                                notRealPerson: record.notRealPerson,
                                otherActivities: record.otherActivities,
                                password: record.password,
                                passwordEncryption: record.passwordEncryption,
                                passwordExpiry: record.passwordExpiry,
                                phoneNumber: record.phoneNumber,
                                pin: record.pin,
                                primaryDutyID: record.primaryDutyID,
                                profilePageID: record.profilePageID,
                                publicFieldsRaw: record.publicFieldsRaw,
                                registeredMFAMethods: record.registeredMFAMethods,
                                rememberLoginHashes: record.rememberLoginHashes,
                                requireMFA: record.requireMFA,
                                resetTokenID: record.resetTokenID,
                                safetyKayakerMembers: record.safetyKayakerMembers,
                                salt: record.salt,
                                seaLogsTheme: record.seaLogsTheme,
                                signupTokenID: record.signupTokenID,
                                superAdmin: record.superAdmin,
                                surname: record.surname,
                                tempIDExpired: record.tempIDExpired,
                                tempIDHash: record.tempIDHash,
                                trainingSessions: trainingSessions.join(','),
                                trainingSessionsDue: trainingSessionsDue.join(','),
                                tripCrewMembers: record.tripCrewMembers,
                                username: record.username,
                                validationKey: record.validationKey,
                                vehicles: vehicles.join(','),
                                viewArchivedMode: record.viewArchivedMode,
                            }
                            if (checkResult) {
                                UpdateSeaLogsMember({
                                    variables: {
                                        input: updateData,
                                    },
                                })
                            } else {
                                CreateSeaLogsMember({
                                    variables: {
                                        input: createData,
                                    },
                                })
                            }
                        })
                        .catch((err) => {
                            console.log('checkRecordError:', err)
                            setUploadError('SeaLogsMembers')
                        })
                })
            )
            setStorageItem('SeaLogsMembers', 'success', '100', 'sync')
            addSuccessResult('SeaLogsMembers', 'sync')
        }
        useEffect(() => {
            setStorageItem('SeaLogsMembers', 'fetching', '0', 'sync')
            getUpdatedRecord()
        }, [flag])

        return <div></div>
    },
)
export default SyncSeaLogsMembers
