import dayjs from 'dayjs'
import db from './db'
import TripEventModel from './tripEvent'
import GeoLocationModel from './geoLocation'
import FuelLogModel from './fuelLog'
class RefuellingBunkeringModel {
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
                await db.RefuellingBunkering.add(dataToSave)
            } else {
                await db.RefuellingBunkering.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.RefuellingBunkering.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.RefuellingBunkering.get() method to retrieve data by idIs
            const data = await db.RefuellingBunkering.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.RefuellingBunkering.where('id')
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
            const response = await db.RefuellingBunkering.where(`${fieldName}`)
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
            // Use the db.RefuellingBunkering.bulkAdd() method to save multiple data to the table
            await db.RefuellingBunkering.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Index:
                    - tripEventID
                    - geoLocationID
                - Relationships:
                    - tripEvent (TripEvent)
                    - geoLocation (GeoLocation)
                    - fuelLog (nodes::FuelLog, refuellingBunkeringID)
        */
        if (data) {
            const tripEvent = await this.tripEventModel.getById(
                data.tripEventID,
            )
            const geoLocation = await this.geoLocationModel.getById(
                data.geoLocationID,
            )
            const fuelLog = await this.fuelLogModel.getByFieldID(
                'refuellingBunkeringID',
                data.refuellingBunkeringID,
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
                let data = await db.RefuellingBunkering.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.RefuellingBunkering.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.RefuellingBunkering.update(item.id, item)
            })
        } catch (error) {
            console.log('RefuellingBunkering:',error)
        }
    }
}

export default RefuellingBunkeringModel
