import dayjs from 'dayjs'
import db from './db'

class TrainingLocationModel {
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
                await db.TrainingLocation.add(dataToSave)
            } else {
                await db.TrainingLocation.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.TrainingLocation.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.TrainingLocation.get() method to retrieve data by idIs
            const data = await db.TrainingLocation.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.TrainingLocation.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.TrainingLocation.bulkAdd() method to save multiple data to the table
            await db.TrainingLocation.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.TrainingLocation.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.TrainingLocation.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.TrainingLocation.update(item.id, item)
            })
        } catch (error) {
            console.log('TrainingLocation:',error)
        }
    }
}

export default TrainingLocationModel
