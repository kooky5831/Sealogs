import dayjs from 'dayjs'
import db from './db'

class SeaLogsMemberModel {
    async save(data) {
        try {
            // Use the db.SeaLogsMember.put() method to save data to the table
            await db.SeaLogsMember.put({
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
            const data = await db.SeaLogsMember.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.SeaLogsMember.get() method to retrieve data by idIs
            const data = await db.SeaLogsMember.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.SeaLogsMember.where('id').anyOf(ids).toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getByVesselId(vesselId) {
        try {
            const data = await db.SeaLogsMember.toArray()
            const filteredData = data.filter((item) => {
                return item.vehicles.nodes.some(
                    (node) => node.id === `${vesselId}`,
                )
            })
            return filteredData
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.SeaLogsMember.bulkAdd() method to save multiple data to the table
            await db.SeaLogsMember.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.SeaLogsMember.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.SeaLogsMember.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.SeaLogsMember.update(item.id, item)
            })
        } catch (error) {
            console.log('Vessel:',error)
        }
    }
}

export default SeaLogsMemberModel
