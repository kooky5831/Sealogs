import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
class CrewWelfare_LogBookEntrySectionModel {
    logBookEntryModel = new LogBookEntryModel()
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
            const dataToSave = {
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                __typename: 'CrewWelfare_LogBookEntrySection',
            }
            let welfare = await this.getById(id)
            if (!welfare) {
                await db.CrewWelfare_LogBookEntrySection.add(dataToSave)
            } else {
                await db.CrewWelfare_LogBookEntrySection.update(id, dataToSave)
            }
            welfare = await this.getById(id)
            // Update logBookEntry section
            const logBookEntry = await this.logBookEntryModel.getById(
                stringifiedData.logBookEntryID,
            )
            if (logBookEntry) {
                let sections = logBookEntry.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\CrewWelfare_LogBookEntrySection',
                    id: stringifiedData.id,
                    __typename: 'CrewWelfare_LogBookEntrySection',
                }
                sections = [...sections, section]
                await this.logBookEntryModel.save({
                    ...logBookEntry,
                    logBookEntrySections: {
                        nodes: sections,
                    },
                })
            }
            return welfare
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.CrewWelfare_LogBookEntrySection.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.CrewWelfare_LogBookEntrySection.get() method to retrieve data by idIs
            const data = await db.CrewWelfare_LogBookEntrySection.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.CrewWelfare_LogBookEntrySection.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.CrewWelfare_LogBookEntrySection.bulkAdd() method to save multiple data to the table
            await db.CrewWelfare_LogBookEntrySection.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.CrewWelfare_LogBookEntrySection.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CrewWelfare_LogBookEntrySection.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CrewWelfare_LogBookEntrySection.update(item.id, item)
            })
        } catch (error) {
            console.log('CrewWelfare_LogBookEntrySection:',error)
        }
    }
}

export default CrewWelfare_LogBookEntrySectionModel
