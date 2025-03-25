import dayjs from 'dayjs'
import db from './db'
import MissionTimelineModel from './missionTimeline'
import CGEventMissionModel from './cgEventMission'

class EventType_PersonRescueModel {
    missionTimelineModel = new MissionTimelineModel()
    cgEventMissionModel = new CGEventMissionModel()
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
                await db.EventType_PersonRescue.add(dataToSave)
            } else {
                await db.EventType_PersonRescue.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_PersonRescue.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_PersonRescue.get() method to retrieve data by idIs
            const data = await db.EventType_PersonRescue.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_PersonRescue.where('id')
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
    async getByTripEventID(id) {
        try {
            const response = await db.EventType_PersonRescue.where(
                'tripEventID',
            )
                .equals(`${id}`)
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
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.EventType_PersonRescue.where(
                `${fieldName}`,
            )
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
            // Use the db.EventType_PersonRescue.bulkAdd() method to save multiple data to the table
            await db.EventType_PersonRescue.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Index:
                    - tripEventID
                - Relationships:
                    - missionTimeline (archived == false, personRescueID)
                    - missionID (CGEventMission)
        */
        if (data) {
            // missionTimeline
            const missionTimeline =
                await this.missionTimelineModel.getByPersonRescueID(data.id)
            // missionID
            const mission = await this.cgEventMissionModel.getById(
                data.missionID,
            )
            return {
                ...data,
                missionTimeline: missionTimeline,
                mission: mission,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_PersonRescue.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_PersonRescue.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_PersonRescue.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_PersonRescue:',error)
        }
    }
}

export default EventType_PersonRescueModel
