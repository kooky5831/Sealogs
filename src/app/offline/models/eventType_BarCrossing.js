import dayjs from 'dayjs'
import db from './db'
import TripEventModel from './tripEvent'
import GeoLocationModel from './geoLocation'
import BarCrossingChecklistModel from './barCrossingChecklist'
class EventType_BarCrossingModel {
    tripEventModel = new TripEventModel()
    geoLocationModel = new GeoLocationModel()
    barCrossingChecklistModel = new BarCrossingChecklistModel()
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
                await db.EventType_BarCrossing.add(dataToSave)
            } else {
                await db.EventType_BarCrossing.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_BarCrossing.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_BarCrossing.get() method to retrieve data by idIs
            const data = await db.EventType_BarCrossing.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_BarCrossing.where('id')
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
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.EventType_BarCrossing.where(
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
            // Use the db.EventType_BarCrossing.bulkAdd() method to save multiple data to the table
            await db.EventType_BarCrossing.bulkAdd(data)
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
                    - geoLocationCompletedID
                    - barCrossingChecklistID
                - Relationships:
                    - tripEvent (TripEvent)
                    - geoLocation (GeoLocation)
                    - geoLocationCompleted (GeoLocation)
                    - barCrossingChecklist (BarCrossingChecklist)
        */
        if (data) {
            const tripEvent = await this.tripEventModel.getById(
                data.tripEventID,
            )
            const geoLocation = await this.geoLocationModel.getById(
                data.geoLocationID,
            )
            const geoLocationCompleted = await this.geoLocationModel.getById(
                data.geoLocationCompletedID,
            )
            const barCrossingChecklist =
                await this.barCrossingChecklistModel.getById(
                    data.barCrossingChecklistID,
                )
            return {
                ...data,
                tripEvent: tripEvent,
                geoLocation: geoLocation,
                geoLocationCompleted: geoLocationCompleted,
                barCrossingChecklist: barCrossingChecklist,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_BarCrossing.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_BarCrossing.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_BarCrossing.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_BarCrossing:',error)
        }
    }
}

export default EventType_BarCrossingModel
