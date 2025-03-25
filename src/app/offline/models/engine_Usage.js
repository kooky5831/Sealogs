import dayjs from 'dayjs'
import db from './db'

class Engine_UsageModel {
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
            let updatedData = await this.getById(id)
            if (!updatedData) {
                await db.Engine_Usage.add(dataToSave)
            } else {
                await db.Engine_Usage.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.Engine_Usage.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.Engine_Usage.get() method to retrieve data by idIs
            const data = await db.Engine_Usage.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.Engine_Usage.where('id')
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                response.map(async (data) => {
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
    async getByMaintenanceScheduleID(id) {
        try {
            const response = await db.Engine_Usage.where(
                'maintenanceScheduleID',
            )
                .equals(`${id}`)
                .toArray()
            const updatedData = Promise.all(
                response.map(async (data) => {
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
    async getByEngineID(id) {
        try {
            const response = await db.Engine_Usage.where('engineID')
                .equals(`${id}`)
                .toArray()
            const updatedData = Promise.all(
                response.map(async (data) => {
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
            // Use the db.Engine_Usage.bulkAdd() method to save multiple data to the table
            await db.Engine_Usage.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        return data
        /*
            - Indices:
                - maintenanceScheduleID
                - engineID
        */
        /* if (data) {
            // authorID
            const author = await this.seaLogsMemberModel.getById(data.authorID)
            return {
                ...data,
                author: author,
            }
        } else {
            return data
        } */
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.Engine_Usage.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.Engine_Usage.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.Engine_Usage.update(item.id, item)
            })
        } catch (error) {
            console.log('Engine_Usage:',error)
        }
    }
}

export default Engine_UsageModel
