import dayjs from 'dayjs'
import db from './db'
import EventType_SupernumeraryModel from './eventType_Supernumerary'

class TripEventModel {
    supernumeraryModel = new EventType_SupernumeraryModel()
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
                await db.TripEvent.add(dataToSave)
            } else {
                await db.TripEvent.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.TripEvent.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.TripEvent.get() method to retrieve data by idIs
            const data = await db.TripEvent.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.TripEvent.where('id').anyOf(ids).toArray()
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
    async bulkAdd(data) {
        try {
            // Use the db.TripEvent.bulkAdd() method to save multiple data to the table
            await db.TripEvent.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // supernumeraryID
            const supernumerary = await this.supernumeraryModel.getById(
                data.supernumeraryID,
            )
            return {
                ...data,
                supernumerary: supernumerary,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.TripEvent.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.TripEvent.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate(data) {
        try {
            data.map(async (item) => {
                await db.TripEvent.update(item.id, item)
            })
        } catch (error) {
            console.log('TripEvent:', error)
        }
    }
}

export default TripEventModel
