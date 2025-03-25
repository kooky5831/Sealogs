import dayjs from 'dayjs'
import db from './db'

class GeoLocationModel {
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
                __typename: 'GeoLocation',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let geoLoc = await this.getById(id)
            if (!geoLoc) {
                await db.GeoLocation.add(dataToSave)
            } else {
                await db.GeoLocation.update(id, dataToSave)
            }
            geoLoc = await this.getById(id)
            return geoLoc
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.GeoLocation.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.GeoLocation.get() method to retrieve data by idIs
            const data = await db.GeoLocation.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.GeoLocation.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.GeoLocation.bulkAdd() method to save multiple data to the table
            await db.GeoLocation.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.GeoLocation.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.GeoLocation.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.GeoLocation.update(item.id, item)
            })
        } catch (error) {
            console.log('GeoLocation:',error)
        }
    }
}

export default GeoLocationModel
