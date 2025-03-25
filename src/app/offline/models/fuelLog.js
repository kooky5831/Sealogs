import dayjs from 'dayjs'
import db from './db'

class FuelLogModel {
    async save(data) {
        try {
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            const id = stringifiedData.id
            let dataToSave = {
                ...stringifiedData,
                __typename: 'FuelLog',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let fuelLog = await this.getById(id)
            if (!fuelLog) {
                // Create logbook sign off section
                await db.FuelLog.add(dataToSave)
            } else {
                // Update logbook sign off section
                await db.FuelLog.update(stringifiedData.id, dataToSave)
            }
            fuelLog = await this.getById(id)
            return fuelLog
        } catch (error) {
            throw error
        }
    }
    async update(data) {
        try {
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.FuelLog.put() method to save data to the table
            await db.FuelLog.update(stringifiedData.id, {
                ...stringifiedData,
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
            const data = await db.FuelLog.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.FuelLog.get() method to retrieve data by idIs
            const data = await db.FuelLog.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.FuelLog.where(`${fieldName}`)
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
    async getByIds(ids) {
        try {
            const data = await db.FuelLog.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.FuelLog.bulkAdd() method to save multiple data to the table
            await db.FuelLog.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async delete(id) {
        try {
            const data = await db.FuelLog.delete(id)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.FuelLog.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.FuelLog.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.FuelLog.update(item.id, item)
            })
        } catch (error) {
            console.log('FuelLog:',error)
        }
    }
}

export default FuelLogModel
