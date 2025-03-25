import dayjs from 'dayjs'
import db from './db'
import MissionTimelineModel from './missionTimeline'
import CGEventMissionModel from './cgEventMission'
import GeoLocationModel from './geoLocation'
class EventType_VesselRescueModel {
    missionTimelineModel = new MissionTimelineModel()
    cgEventMissionModel = new CGEventMissionModel()
    geoLocationModel = new GeoLocationModel()
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
                await db.EventType_VesselRescue.add(dataToSave)
            } else {
                await db.EventType_VesselRescue.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_VesselRescue.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_VesselRescue.get() method to retrieve data by idIs
            const data = await db.EventType_VesselRescue.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_VesselRescue.where('id')
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
            const response = await db.EventType_VesselRescue.where(
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
            const response = await db.EventType_VesselRescue.where(
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
            // Use the db.EventType_VesselRescue.bulkAdd() method to save multiple data to the table
            await db.EventType_VesselRescue.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Index
                    - tripEventID
                - Relationships:
                    - missionTimeline (archived == false, vesselRescueID)
                    - missionID (CGEventMission)
                    - vesselLocationID (GeoLocation)
        */
        if (data) {
            // missionTimeline
            const missionTimeline =
                await this.missionTimelineModel.getByVesselRescueID(data.id)
            // missionID
            const mission = await this.cgEventMissionModel.getById(
                data.missionID,
            )
            // vesselLocationID
            const vesselLocation = await this.geoLocationModel.getById(
                data.vesselLocationID,
            )
            return {
                ...data,
                missionTimeline: missionTimeline,
                mission: mission,
                vesselLocation: vesselLocation,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_VesselRescue.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_VesselRescue.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_VesselRescue.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_VesselRescue:',error)
        }
    }
}

export default EventType_VesselRescueModel
