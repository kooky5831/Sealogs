import dayjs from 'dayjs'
import db from './db'
import SeaLogsMemberModel from './seaLogsMember'
class MaintenanceCheck_SignatureModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
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
                await db.MaintenanceCheck_Signature.add(dataToSave)
            } else {
                await db.MaintenanceCheck_Signature.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.MaintenanceCheck_Signature.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.MaintenanceCheck_Signature.get() method to retrieve data by idIs
            const data = await db.MaintenanceCheck_Signature.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.MaintenanceCheck_Signature.where('id')
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
    async bulkAdd(data) {
        try {
            // Use the db.MaintenanceCheck_Signature.bulkAdd() method to save multiple data to the table
            await db.MaintenanceCheck_Signature.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - member (SeaLogsMemberInterface)
                - maintenanceCheck (MaintenanceCheckInterface) - this causes infinite loop!
        */
        if (data) {
            // memberID
            const member = await this.seaLogsMemberModel.getById(data.memberID)
            return {
                ...data,
                member: member,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.MaintenanceCheck_Signature.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.MaintenanceCheck_Signature.update(id, data)
            return data}
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.MaintenanceCheck_Signature.update(item.id, item)
            })
        } catch (error) {
            console.log('multiUpdate:',error)
        }
    }
}

export default MaintenanceCheck_SignatureModel
