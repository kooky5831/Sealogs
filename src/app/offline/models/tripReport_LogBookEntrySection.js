import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
import GeoLocationModel from './geoLocation'
class TripReport_LogBookEntrySectionModel {
    logBookEntryModel = new LogBookEntryModel()
    geoLocationModel = new GeoLocationModel()
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
                __typename: 'TripReport_LogBookEntrySection',
            }
            let tripReport = await this.getById(id)
            if (!tripReport) {
                // Create trip report
                await db.TripReport_LogBookEntrySection.add(dataToSave)
            } else {
                // Update trip report
                await db.TripReport_LogBookEntrySection.update(id, dataToSave)
            }
            const logBookEntry = await this.logBookEntryModel.getById(
                stringifiedData.logBookEntryID,
            )
            if (logBookEntry) {
                let sections = logBookEntry.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\TripReport_LogBookEntrySection',
                    id: stringifiedData.id,
                    __typename: 'TripReport_LogBookEntrySection',
                }
                sections = [...sections, section]
                await this.logBookEntryModel.save({
                    ...logBookEntry,
                    logBookEntrySections: {
                        nodes: sections,
                    },
                })
            }
            tripReport = await this.getById(id)
            return tripReport
        } catch (error) {
            throw error
        }
    }
    async update(data) {
        try {
            // Use the db.TripReport_LogBookEntrySection.put() method to save data to the table
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            await db.TripReport_LogBookEntrySection.update(stringifiedData.id, {
                ...stringifiedData,
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
            const data = await db.TripReport_LogBookEntrySection.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.TripReport_LogBookEntrySection.get() method to retrieve data by idIs
            const data = await db.TripReport_LogBookEntrySection.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const tripReports = await db.TripReport_LogBookEntrySection.where(
                'id',
            )
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                tripReports.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.TripReport_LogBookEntrySection.bulkAdd() method to save multiple data to the table
            await db.TripReport_LogBookEntrySection.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // fromLocationID
            const fromLocation = await this.geoLocationModel.getById(
                data.fromLocationID,
            )
            // toLocationID
            const toLocation = await this.geoLocationModel.getById(
                data.toLocationID,
            )
            return {
                ...data,
                fromLocation: fromLocation,
                toLocation: toLocation,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.TripReport_LogBookEntrySection.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.TripReport_LogBookEntrySection.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.TripReport_LogBookEntrySection.update(item.id, item)
            })
        } catch (error) {
            console.log('TripReport_LogBookEntrySection:',error)
        }
    }
}

export default TripReport_LogBookEntrySectionModel
