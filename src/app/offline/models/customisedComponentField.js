import dayjs from 'dayjs'
import db from './db'

class CustomisedComponentFieldModel {
    async save(data) {
        try {
            // Use the db.CustomisedComponentField.put() method to save data to the table
            await db.CustomisedComponentField.put({
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
            const data = await db.CustomisedComponentField.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.CustomisedComponentField.get() method to retrieve data by idIs
            const data = await db.CustomisedComponentField.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.CustomisedComponentField.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.CustomisedComponentField.bulkAdd() method to save multiple data to the table
            await db.CustomisedComponentField.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.CustomisedComponentField.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CustomisedComponentField.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CustomisedComponentField.update(item.id, item)
            })
        } catch (error) {
            console.log('CustomisedComponentField:',error)
        }
    }
}

export default CustomisedComponentFieldModel
