import dayjs from 'dayjs'
import db from './db'

class ClientModel {
    async save(data) {
        try {
            // Use the db.Client.put() method to save data to the table
            await db.Client.put({
                ...data,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.Client.get() method to retrieve data by idIs
            const data = await db.Client.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    // async bulkAdd(data) {
    //     try {
    //         // Use the db.Client.bulkAdd() method to save multiple data to the table
    //         await db.Client.bulkAdd(data)
    //         return data
    //     } catch (error) {
    //         throw error
    //     }
    // }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.Client.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.Client.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
}

export default ClientModel
