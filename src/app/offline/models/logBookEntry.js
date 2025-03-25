import dayjs from 'dayjs'
import db from './db'

class LogBookEntryModel {
    async save(data) {
        try {
            // Convert number properties to strings
            let stringifiedData = Object.fromEntries(
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
                __typename: 'LogBookEntry',
            }
            let logbook = await this.getById(id)
            if (!logbook) {
                // Create logbook
                await db.LogBookEntry.add(dataToSave)
            } else {
                // Update logbook
                await db.LogBookEntry.update(data.id, dataToSave)
            }
            logbook = await this.getById(id)
            return logbook
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.LogBookEntry.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.LogBookEntry.get() method to retrieve data by idIs
            const data = await db.LogBookEntry.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByVesselId(vesselId) {
        try {
            const data = await db.LogBookEntry.where('vehicleID')
                .equals(`${vesselId}`)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.LogBookEntry.bulkAdd() method to save multiple data to the table
            await db.LogBookEntry.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.LogBookEntry.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.LogBookEntry.update(id, data);
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.LogBookEntry.update(item.id, item)
            })
        } catch (error) {
            console.log('LogBookEntry:',error)
        }
    }
}

export default LogBookEntryModel
