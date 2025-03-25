import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
import LogBookEntrySection_SignatureModel from './logBookEntrySection_Signature'
class LogBookSignOff_LogBookEntrySectionModel {
    logBookEntryModel = new LogBookEntryModel()
    signatureModel = new LogBookEntrySection_SignatureModel()
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
                __typename: 'LogBookSignOff_LogBookEntrySection',
            }
            let logbookSignOff = await this.getById(id)
            if (!logbookSignOff) {
                // Create logbook sign off section
                await db.LogBookSignOff_LogBookEntrySection.add(dataToSave)
            } else {
                // Update logbook sign off section
                await db.LogBookSignOff_LogBookEntrySection.update(
                    data.id,
                    dataToSave,
                )
            }
            // Update logBookEntry section
            const logBookEntry = await this.logBookEntryModel.getById(
                stringifiedData.logBookEntryID,
            )
            if (logBookEntry) {
                let sections = logBookEntry.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\LogBookSignOff_LogBookEntrySection',
                    id: stringifiedData.id,
                    __typename: 'LogBookSignOff_LogBookEntrySection',
                }
                sections = [...sections, section]
                await this.logBookEntryModel.save({
                    ...logBookEntry,
                    logBookEntrySections: {
                        nodes: sections,
                    },
                })
            }
            logbookSignOff = await this.getById(id)
            return logbookSignOff
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.LogBookSignOff_LogBookEntrySection.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.LogBookSignOff_LogBookEntrySection.get() method to retrieve data by idIs
            const data = await db.LogBookSignOff_LogBookEntrySection.get(
                `${id}`,
            )
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const signOffs = await db.LogBookSignOff_LogBookEntrySection.where(
                'id',
            )
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                signOffs.map(async (data) => {
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
            // Use the db.LogBookSignOff_LogBookEntrySection.bulkAdd() method to save multiple data to the table
            await db.LogBookSignOff_LogBookEntrySection.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // sectionSignatureID
            const sectionSignature = await this.signatureModel.getById(
                data.sectionSignatureID,
            )
            return {
                ...data,
                sectionSignature: sectionSignature,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.LogBookSignOff_LogBookEntrySection.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.LogBookSignOff_LogBookEntrySection.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.LogBookSignOff_LogBookEntrySection.update(item.id, item)
            })
        } catch (error) {
            console.log('LogBookSignOff_LogBookEntrySection:',error)
        }
    }
}

export default LogBookSignOff_LogBookEntrySectionModel
