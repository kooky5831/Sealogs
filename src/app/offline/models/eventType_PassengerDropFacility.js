import dayjs from 'dayjs'
import db from './db'
import TripEventModel from './tripEvent'
import GeoLocationModel from './geoLocation'
import FuelLogModel from './fuelLog'
class EventType_PassengerDropFacilityModel {
    tripEventModel = new TripEventModel()
    geoLocationModel = new GeoLocationModel()
    fuelLogModel = new FuelLogModel()
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
                await db.EventType_PassengerDropFacility.add(dataToSave)
            } else {
                await db.EventType_PassengerDropFacility.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_PassengerDropFacility.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_PassengerDropFacility.get() method to retrieve data by idIs
            const data = await db.EventType_PassengerDropFacility.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_PassengerDropFacility.where(
                'id',
            )
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
            const response = await db.EventType_PassengerDropFacility.where(
                'vesselID',
            )
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
            const response = await db.EventType_PassengerDropFacility.where(
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
            // Use the db.EventType_PassengerDropFacility.bulkAdd() method to save multiple data to the table
            await db.EventType_PassengerDropFacility.bulkAdd(data)
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
                - Relationships:
                    - tripEvent (TripEvent)
                    - geoLocation (GeoLocation)
                    - fuelLog (FuelLog, eventType_PassengerDropFacilityID)
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
            // fuelLog
            const fuelLog = await this.fuelLogModel.getByFieldID(
                'eventType_PassengerDropFacilityID',
                data.eventType_PassengerDropFacilityID,
            )
            return {
                ...data,
                tripEvent: tripEvent,
                geoLocation: geoLocation,
                fuelLog: { nodes: fuelLog },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_PassengerDropFacility.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_PassengerDropFacility.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_PassengerDropFacility.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_PassengerDropFacility:',error)
        }
    }
}

export default EventType_PassengerDropFacilityModel
