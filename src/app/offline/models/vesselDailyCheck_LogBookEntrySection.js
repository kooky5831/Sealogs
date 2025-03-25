import dayjs from 'dayjs'
import db from './db'

class VesselDailyCheck_LogBookEntrySectionModel {
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
                __typename: 'VesselDailyCheck_LogBookEntrySection',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let vdc = await this.getById(id)
            if (!vdc) {
                await db.VesselDailyCheck_LogBookEntrySection.add(dataToSave)
            } else {
                await db.VesselDailyCheck_LogBookEntrySection.update(
                    id,
                    dataToSave,
                )
            }
            vdc = await this.getById(id)
            return vdc
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.VesselDailyCheck_LogBookEntrySection.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.VesselDailyCheck_LogBookEntrySection.get() method to retrieve data by idIs
            const data = await db.VesselDailyCheck_LogBookEntrySection.get(
                `${id}`,
            )
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.VesselDailyCheck_LogBookEntrySection.where(
                'id',
            )
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.VesselDailyCheck_LogBookEntrySection.bulkAdd() method to save multiple data to the table
            await db.VesselDailyCheck_LogBookEntrySection.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.VesselDailyCheck_LogBookEntrySection.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.VesselDailyCheck_LogBookEntrySection.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.VesselDailyCheck_LogBookEntrySection.update(item.id, item)
            })
        } catch (error) {
            console.log('VesselDailyCheck_LogBookEntrySection:',error)
        }
    }
}

export default VesselDailyCheck_LogBookEntrySectionModel
