import dayjs from 'dayjs'
import db from './db'

class FuelTankModel {
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
                __typename: 'FuelTanks',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let fuelTank = await this.getById(id)
            if (!fuelTank) {
                await db.FuelTank.add(dataToSave)
            } else {
                await db.FuelTank.update(id, dataToSave)
            }
            fuelTank = await this.getById(id)
            return fuelTank
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
            // Use the db.FuelTank.put() method to save data to the table
            await db.FuelTank.update(stringifiedData.id, {
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
            const data = await db.FuelTank.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.FuelTank.get() method to retrieve data by idIs
            const data = await db.FuelTank.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.FuelTank.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.FuelTank.bulkAdd() method to save multiple data to the table
            await db.FuelTank.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async delete(id) {
        try {
            const data = await db.FuelTank.delete(id)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.FuelTank.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.FuelTank.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.FuelTank.update(item.id, item)
            })
        } catch (error) {
            console.log('FuelTank:',error)
        }
    }
}

export default FuelTankModel
