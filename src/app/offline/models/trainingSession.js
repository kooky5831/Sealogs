import dayjs from 'dayjs'
import db from './db'
import SeaLogsMemberModel from './seaLogsMember'
import VesselModel from './vessel'
import GeoLocationModel from './geoLocation'
import TrainingLocationModel from './trainingLocation'
import MemberTraining_SignatureModel from './memberTraining_Signature'
class TrainingSessionModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
    vesselModel = new VesselModel()
    geoLocationModel = new GeoLocationModel()
    trainingLocationModel = new TrainingLocationModel()
    memberTraining_SignatureModel = new MemberTraining_SignatureModel()
    async save(data) {
        try {
            // Convert number properties to strings
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            const id = stringifiedData.id
            let dataToSave = {
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let updatedData = await this.getById(id)
            if (!updatedData) {
                await db.TrainingSession.add(dataToSave)
            } else {
                await db.TrainingSession.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.TrainingSession.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.TrainingSession.get() method to retrieve data by idIs
            const data = await db.TrainingSession.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.TrainingSession.where('id')
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getByVesselID(id) {
        try {
            const response = await db.TrainingSession.where('vesselID')
                .equals(`${id}`)
                .toArray()
            return response // I did not add relationships here to avoid infinte loop
            /* const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData */
        } catch (error) {
            throw error
        }
    }
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.TrainingSession.where(`${fieldName}`)
                .equals(`${fieldID}`)
                .toArray()
            return response // I did not add relationships here to avoid infinte loop
            /* const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData */
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.TrainingSession.bulkAdd() method to save multiple data to the table
            await db.TrainingSession.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Indices
                    - trainerID
                    - logBookEntrySectionID
                    - logBookEntryID
                    - vesselID
                    - trainingLocationID
                    - geoLocationID
                - Relationships
                    - trainer (SeaLogsMemberInterface)
                    - logBookEntrySection (CrewTraining_LogBookEntrySectionInterface)
                    - logBookEntry (LogBookEntry)
                    - vessel (VesselInterface)
                    - trainingLocation (TrainingLocation)
                    - geoLocation (GeoLocation)
                    - signatures (nodes:MemberTraining_SignatureInterface, trainingSessionID)
                    - members (nodes: SeaLogsMemberInterface, many to many)
                    - trainingTypes (nodes: TrainingType, many to many)
        */
        if (data) {
            // trainer
            const trainer = await this.seaLogsMemberModel.getById(
                data.trainerID,
            )
            // vessel
            const vessel = await this.vesselModel.getById(data.vesselID)
            // trainingLocation
            const trainingLocation = await this.trainingLocationModel.getById(
                data.trainingLocationID,
            )
            // geoLocation
            const geoLocation = await this.geoLocationModel.getById(
                data.geoLocationID,
            )
            // signatures
            const signatures =
                await this.memberTraining_SignatureModel.getByFieldID(
                    'trainingSessionID',
                    data.trainingSessionID,
                )
            return {
                ...data,
                trainer: trainer,
                vessel: vessel,
                trainingLocation: trainingLocation,
                geoLocation: geoLocation,
                signatures: { nodes: signatures },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.TrainingSession.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.TrainingSession.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.TrainingSession.update(item.id, item)
            })
        } catch (error) {
            console.log('TrainingSession:',error)
        }
    }
}

export default TrainingSessionModel
