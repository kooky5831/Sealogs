import dayjs from 'dayjs'
import db from './db'

class ComponentMaintenanceCheckModel {
    async save(data) {
        try {
            // Convert number properties to strings
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.ComponentMaintenanceCheck.put() method to save data to the table
            await db.ComponentMaintenanceCheck.put({
                ...stringifiedData,
                __typename: 'ComponentMaintenanceCheck',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            return stringifiedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.ComponentMaintenanceCheck.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.ComponentMaintenanceCheck.get() method to retrieve data by idIs
            const data = await db.ComponentMaintenanceCheck.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.ComponentMaintenanceCheck.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.ComponentMaintenanceCheck.bulkAdd() method to save multiple data to the table
            await db.ComponentMaintenanceCheck.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.ComponentMaintenanceCheck.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.ComponentMaintenanceCheck.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.ComponentMaintenanceCheck.update(item.id, item)
            })
        } catch (error) {
            console.log('ComponentMaintenanceCheck:',error)
        }
    }
}

export default ComponentMaintenanceCheckModel
