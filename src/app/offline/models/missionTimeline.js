import dayjs from 'dayjs'
import db from './db'
import SeaLogsMemberModel from './seaLogsMember'

class MissionTimelineModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
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
                await db.MissionTimeline.add(dataToSave)
            } else {
                await db.MissionTimeline.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.MissionTimeline.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.MissionTimeline.get() method to retrieve data by idIs
            const data = await db.MissionTimeline.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.MissionTimeline.where('id')
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
    async getByVesselRescueID(id) {
        try {
            const response = await db.MissionTimeline.where('vesselRescueID')
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
    async getByPersonRescueID(id) {
        try {
            const response = await db.MissionTimeline.where('personRescueID')
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
    async bulkAdd(data) {
        try {
            // Use the db.MissionTimeline.bulkAdd() method to save multiple data to the table
            await db.MissionTimeline.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                authorID (SeaLogsMember)
            - Indices:
                missionID (CGEventMission)
                vesselRescueID (EventType_VesselRescue)
                personRescueID (EventType_PersonRescue)
                maintenanceCheckID (MaintenanceCheck)
                subTaskID (MaintenanceScheduleSubTask)
        */
        if (data) {
            // authorID
            const author = await this.seaLogsMemberModel.getById(data.authorID)
            return {
                ...data,
                author: author,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.MissionTimeline.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.MissionTimeline.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.MissionTimeline.update(item.id, item)
            })
        } catch (error) {
            console.log('MissionTimeline:',error)
        }
    }
}

export default MissionTimelineModel
