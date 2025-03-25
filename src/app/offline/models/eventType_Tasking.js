import dayjs from 'dayjs'
import db from './db'
import TripEventModel from './tripEvent'
import GeoLocationModel from './geoLocation'
import FuelLogModel from './fuelLog'
import EventType_VesselRescueModel from './eventType_VesselRescue'
import EventType_PersonRescueModel from './eventType_PersonRescue'
import TowingChecklistModel from './towingChecklist'
class EventType_TaskingModel {
    tripEventModel = new TripEventModel()
    geoLocationModel = new GeoLocationModel()
    fuelLogModel = new FuelLogModel()
    eventType_VesselRescueModel = new EventType_VesselRescueModel()
    eventType_PersonRescueModel = new EventType_PersonRescueModel()
    towingChecklistModel = new TowingChecklistModel()
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
                await db.EventType_Tasking.add(dataToSave)
            } else {
                await db.EventType_Tasking.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_Tasking.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_Tasking.get() method to retrieve data by idIs
            const data = await db.EventType_Tasking.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_Tasking.where('id')
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
            const response = await db.EventType_Tasking.where('vesselID')
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
            const response = await db.EventType_Tasking.where(`${fieldName}`)
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
            // Use the db.EventType_Tasking.bulkAdd() method to save multiple data to the table
            await db.EventType_Tasking.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Indices:
                    - tripEventID
                    - geoLocationID
                    - vesselRescueID
                    - personRescueID
                    - towingChecklistID
                    - parentTaskingID
                - Relationships:
                    - tripEvent (TripEvent)
                    - geoLocation (GeoLocation)
                    - vesselRescue (EventType_VesselRescue)
                    - personRescue (EventType_PersonRescue)
                    - towingChecklist (TowingChecklist)
                    - parentTasking (EventType_Tasking) // remove this if it causes infinite loop
                    - fuelLog (nodes::FuelLog, eventType_TaskingID)
        */
        if (data) {
            // tripEvent
            const tripEvent = await this.tripEventModel.getById(
                data.tripEventID,
            )
            // geoLocation
            const geoLocation = await this.geoLocationModel.getById(
                data.geoLocationID,
            )
            // vesselRescue
            const vesselRescue = await this.eventType_VesselRescueModel.getById(
                data.vesselRescueID,
            )
            // personRescue
            const personRescue = await this.eventType_PersonRescueModel.getById(
                data.personRescueID,
            )
            // towingChecklist
            const towingChecklist = await this.towingChecklistModel.getById(
                data.towingChecklistID,
            )
            // parentTasking
            const parentTasking = await this.getById(data.parentTaskingID)
            // fuelLog
            const fuelLog = await this.fuelLogModel.getByFieldID(
                'eventType_TaskingID',
                data.eventType_TaskingID,
            )
            return {
                ...data,
                tripEvent: tripEvent,
                geoLocation: geoLocation,
                vesselRescue: vesselRescue,
                personRescue: personRescue,
                towingChecklist: towingChecklist,
                parentTasking: parentTasking,
                fuelLog: { nodes: fuelLog },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_Tasking.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_Tasking.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_Tasking.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_Tasking:',error)
        }
    }
}

export default EventType_TaskingModel
