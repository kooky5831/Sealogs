import dayjs from 'dayjs'
import db from './db'

class WeatherTideModel {
    async save(data) {
        try {
            // Use the db.WeatherTide.put() method to save data to the table
            await db.WeatherTide.put({
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
            const data = await db.WeatherTide.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.WeatherTide.get() method to retrieve data by idIs
            const data = await db.WeatherTide.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.WeatherTide.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.WeatherTide.bulkAdd() method to save multiple data to the table
            await db.WeatherTide.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.WeatherTide.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.WeatherTide.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.WeatherTide.update(item.id, item)
            })
        } catch (error) {
            console.log('WeatherTide:',error)
        }
    }
}

export default WeatherTideModel
