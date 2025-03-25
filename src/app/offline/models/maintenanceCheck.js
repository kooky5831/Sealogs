import dayjs from 'dayjs'
import db from './db'
import MaintenanceScheduleModel from './maintenanceSchedule'
import MaintenanceCheck_SignatureModel from './maintenanceCheck_Signature'
class MaintenanceCheckModel {
    maintenanceScheduleModel = new MaintenanceScheduleModel()
    maintenanceCheck_SignatureModel = new MaintenanceCheck_SignatureModel()
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
                await db.MaintenanceCheck.add(dataToSave)
            } else {
                await db.MaintenanceCheck.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.MaintenanceCheck.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.MaintenanceCheck.get() method to retrieve data by idIs
            const data = await db.MaintenanceCheck.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.MaintenanceCheck.where('id')
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
            const response = await db.MaintenanceCheck.where(
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
    async bulkAdd(data) {
        try {
            // Use the db.MaintenanceCheck.bulkAdd() method to save multiple data to the table
            await db.MaintenanceCheck.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - maintenanceSchedule (maintenanceSchedule)
                - maintenanceCheck_Signature (maintenanceCheck_Signature)
        */
        if (data) {
            // maintenanceScheduleID
            const maintenanceSchedule =
                await this.maintenanceScheduleModel.getById(
                    data.maintenanceScheduleID,
                )
            // maintenanceCheck_SignatureID
            const maintenanceCheck_Signature =
                await this.maintenanceCheck_SignatureModel.getById(
                    data.maintenanceCheck_SignatureID,
                )
            return {
                ...data,
                maintenanceSchedule: maintenanceSchedule,
                maintenanceCheck_Signature: maintenanceCheck_Signature,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.MaintenanceCheck.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.MaintenanceCheck.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.MaintenanceCheck.update(item.id, item)
            })
        } catch (error) {
            console.log('MaintenanceCheck:',error)
        }
    }
}

export default MaintenanceCheckModel
