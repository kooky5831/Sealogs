import dayjs from 'dayjs'
import db from './db'

class EngineModel {
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
                __typename: 'Engine',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let engine = await this.getById(id)
            if (!engine) {
                await db.Engine.add(dataToSave)
            } else {
                await db.Engine.update(id, dataToSave)
            }
            engine = await this.getById(id)
            return engine
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.Engine.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.Engine.get() method to retrieve data by idIs
            const data = await db.Engine.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.Engine.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.Engine.bulkAdd() method to save multiple data to the table
            await db.Engine.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.Engine.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.Engine.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.Engine.update(item.id, item)
            })
        } catch (error) {
            console.log('Engine:',error)
        }
    }
}

export default EngineModel
