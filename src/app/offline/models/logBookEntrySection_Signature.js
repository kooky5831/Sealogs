import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
import SeaLogsMemberModel from './seaLogsMember'

class LogBookEntrySection_SignatureModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
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
            let dataToSave = {
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let signature = await this.getById(id)
            if (!signature) {
                await db.LogBookEntrySection_Signature.add(dataToSave)
            } else {
                await db.LogBookEntrySection_Signature.update(id, dataToSave)
            }
            signature = await this.getById(id)
            return signature
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.LogBookEntrySection_Signature.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.LogBookEntrySection_Signature.get() method to retrieve data by idIs
            const data = await db.LogBookEntrySection_Signature.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.LogBookEntrySection_Signature.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.LogBookEntrySection_Signature.bulkAdd() method to save multiple data to the table
            await db.LogBookEntrySection_Signature.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    /* async addRelationships(data) {
        if (data) {
            // member
            const member = await this.seaLogsMemberModel.getById(
                data.crewMemberID,
            )
            // logBookEntrySection
            const logBookEntrySection = await this.logBookEntrySection.getById(
                data.dutyPerformedID,
            )
            return {
                ...data,
                member: member,
                logBookEntrySection: dutyPerformed,
            }
        } else {
            return data
        }
    } */
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.LogBookEntrySection_Signature.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.LogBookEntrySection_Signature.update(id, data)
                return data
            } 
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.LogBookEntrySection_Signature.update(item.id, item)
            })
        } catch (error) {
            console.log('multiUpdate:',error)
        }
    }
}

export default LogBookEntrySection_SignatureModel
