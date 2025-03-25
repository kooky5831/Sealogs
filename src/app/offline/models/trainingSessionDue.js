import dayjs from 'dayjs'
import db from './db'

class TrainingSessionDueModel {
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
                await db.TrainingSessionDue.add(dataToSave)
            } else {
                await db.TrainingSessionDue.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.TrainingSessionDue.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.TrainingSessionDue.get() method to retrieve data by idIs
            const data = await db.TrainingSessionDue.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.TrainingSessionDue.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.TrainingSessionDue.where(`${fieldName}`)
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
            // Use the db.TrainingSessionDue.bulkAdd() method to save multiple data to the table
            await db.TrainingSessionDue.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.TrainingSessionDue.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.TrainingSessionDue.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.TrainingSessionDue.update(item.id, item)
            })
        } catch (error) {
            console.log('TrainingSessionDue:',error)
        }
    }
}

export default TrainingSessionDueModel
