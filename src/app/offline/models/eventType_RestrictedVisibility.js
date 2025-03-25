import dayjs from 'dayjs'
import db from './db'
import TripEventModel from './tripEvent'
import GeoLocationModel from './geoLocation'
class EventType_RestrictedVisibilityModel {
    tripEventModel = new TripEventModel()
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
                await db.EventType_RestrictedVisibility.add(dataToSave)
            } else {
                await db.EventType_RestrictedVisibility.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_RestrictedVisibility.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_RestrictedVisibility.get() method to retrieve data by idIs
            const data = await db.EventType_RestrictedVisibility.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_RestrictedVisibility.where('id')
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
            const response = await db.EventType_RestrictedVisibility.where(
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
            const response = await db.EventType_RestrictedVisibility.where(
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
            // Use the db.EventType_RestrictedVisibility.bulkAdd() method to save multiple data to the table
            await db.EventType_RestrictedVisibility.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Indices
                    - tripEventID
                    - startLocationID
                    - endLocationID
                - Relationships
                    - tripEvent (TripEvent)
                    - startLocation (GeoLocation)
                    - endLocation (GeoLocation)
        */
        if (data) {
            // tripEvent
            const tripEvent = await this.tripEventModel.getById(
                data.tripEventID,
            )
            // startLocation
            const startLocation = await this.geoLocationModel.getById(
                data.startLocationID,
            )
            // endLocation
            const endLocation = await this.geoLocationModel.getById(
                data.endLocationID,
            )
            return {
                ...data,
                tripEvent: tripEvent,
                startLocation: startLocation,
                endLocation: endLocation,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_RestrictedVisibility.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_RestrictedVisibility.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_RestrictedVisibility.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_RestrictedVisibility:',error)
        }
    }
}

export default EventType_RestrictedVisibilityModel
