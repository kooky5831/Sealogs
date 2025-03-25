import dayjs from 'dayjs'
import db from './db'
import Supernumerary_LogBookEntrySectionModel from './supernumerary_LogBookEntrySection'
class EventType_SupernumeraryModel {
    supernumerary_LogBookEntrySectionModel =
        new Supernumerary_LogBookEntrySectionModel()
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
                await db.EventType_Supernumerary.add(dataToSave)
            } else {
                await db.EventType_Supernumerary.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.EventType_Supernumerary.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.EventType_Supernumerary.get() method to retrieve data by idIs
            const data = await db.EventType_Supernumerary.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.EventType_Supernumerary.where('id')
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
            const response = await db.EventType_Supernumerary.where(
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
            // Use the db.EventType_Supernumerary.bulkAdd() method to save multiple data to the table
            await db.EventType_Supernumerary.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Relationships:
                    - guestList (nodes:Supernumerary_LogBookEntrySections, supernumeraryID)
        */
        if (data) {
            // guestList
            const guestList =
                await this.supernumerary_LogBookEntrySectionModel.getByFieldID(
                    'supernumeraryID',
                    data.id,
                )
            return {
                ...data,
                guestList: { nodes: guestList },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.EventType_Supernumerary.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.EventType_Supernumerary.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.EventType_Supernumerary.update(item.id, item)
            })
        } catch (error) {
            console.log('EventType_Supernumerary:',error)
        }
    }
}

export default EventType_SupernumeraryModel
