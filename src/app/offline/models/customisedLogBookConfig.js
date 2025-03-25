import dayjs from 'dayjs'
import db from './db'

class CustomisedLogBookConfigModel {
    async save(data) {
        try {
            // Use the db.CustomisedLogBookConfig.put() method to save data to the table
            await db.CustomisedLogBookConfig.put({
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
            const data = await db.CustomisedLogBookConfig.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.CustomisedLogBookConfig.get() method to retrieve data by idIs
            const data = await db.CustomisedLogBookConfig.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByCustomisedLogBookId(id) {
        try {
            const data = await db.CustomisedLogBookConfig.where(
                'customisedLogBookID',
            )
                .equals(`${id}`)
                .toArray()
            return data && data.length > 0 ? data[0] : null
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.CustomisedLogBookConfig.bulkAdd() method to save multiple data to the table
            await db.CustomisedLogBookConfig.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.CustomisedLogBookConfig.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CustomisedLogBookConfig.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CustomisedLogBookConfig.update(item.id, item)
            })
        } catch (error) {
            console.log('CustomisedLogBookConfig:',error)
        }
    }
}

export default CustomisedLogBookConfigModel
