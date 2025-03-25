import dayjs from 'dayjs'
import db from './db'

class CrewDutyModel {
    async save(data) {
        try {
            // Use the db.CrewDuty.put() method to save data to the table
            await db.CrewDuty.put({
                ...data,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            return data
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.CrewDuty.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.CrewDuty.get() method to retrieve data by idIs
            const data = await db.CrewDuty.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.CrewDuty.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.CrewDuty.bulkAdd() method to save multiple data to the table
            await db.CrewDuty.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.CrewDuty.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CrewDuty.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CrewDuty.update(item.id, item)
            })
        } catch (error) {
            console.log('CrewDuty:',error)
        }
    }
}

export default CrewDutyModel
