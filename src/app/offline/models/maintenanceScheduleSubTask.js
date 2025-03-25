import dayjs from 'dayjs'
import db from './db'
import InventoryModel from './inventory'
class MaintenanceScheduleSubTaskModel {
    inventoryModel = new InventoryModel()
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
                await db.MaintenanceScheduleSubTask.add(dataToSave)
            } else {
                await db.MaintenanceScheduleSubTask.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.MaintenanceScheduleSubTask.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.MaintenanceScheduleSubTask.get() method to retrieve data by idIs
            const data = await db.MaintenanceScheduleSubTask.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByComponentMaintenanceScheduleId(id) {
        try {
            const response = await db.MaintenanceScheduleSubTask.where(
                'componentMaintenanceScheduleID',
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
    async getByIds(ids) {
        try {
            const response = await db.MaintenanceScheduleSubTask.where('id')
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
            // Use the db.MaintenanceScheduleSubTask.bulkAdd() method to save multiple data to the table
            await db.MaintenanceScheduleSubTask.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - componentMaintenanceSchedule (ComponentMaintenanceSchedule) - this could possibly cause infinite loop
                - inventory (Inventory)
        */
        if (data) {
            // inventoryID
            const inventory = await this.inventoryModel.getById(
                data.inventoryID,
            )
            return {
                ...data,
                inventory: inventory,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.MaintenanceScheduleSubTask.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.MaintenanceScheduleSubTask.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.MaintenanceScheduleSubTask.update(item.id, item)
            })
        } catch (error) {
            console.log('MaintenanceScheduleSubTask:',error)
        }
    }
}

export default MaintenanceScheduleSubTaskModel
