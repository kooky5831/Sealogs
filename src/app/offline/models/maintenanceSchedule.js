import dayjs from 'dayjs'
import db from './db'
import InventoryModel from './inventory'
import Engine_UsageModel from './engine_Usage'
class MaintenanceScheduleModel {
    inventoryModel = new InventoryModel()
    engineUsageModel = new Engine_UsageModel()
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
                await db.MaintenanceSchedule.add(dataToSave)
            } else {
                await db.MaintenanceSchedule.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.MaintenanceSchedule.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.MaintenanceSchedule.get() method to retrieve data by idIs
            const data = await db.MaintenanceSchedule.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.MaintenanceSchedule.where('id')
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
            // Use the db.MaintenanceSchedule.bulkAdd() method to save multiple data to the table
            await db.MaintenanceSchedule.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - inventory (Inventory)
                - maintenanceChecks (MaintenanceCheckInterfaceConnection) - this causes infinite loop!
                - engineUsage (Engine_UsageConnection)
        */
        if (data) {
            // inventoryID
            const inventory = await this.inventoryModel.getById(
                data.inventoryID,
            )
            // engineUsage
            const engineUsage =
                await this.engineUsageModel.getByMaintenanceScheduleID(data.id)
            return {
                ...data,
                inventory: inventory,
                engineUsage: engineUsage,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            let data = await db.MaintenanceSchedule.get(`${id}`)
            data.idbCRUD = 'Download'
            data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
            await db.MaintenanceSchedule.update(id, data)
            return data
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.MaintenanceSchedule.update(item.id, item)
            })
        } catch (error) {
            console.log('MaintenanceSchedule:',error)
        }
    }
}

export default MaintenanceScheduleModel
