import dayjs from 'dayjs'
import db from './db'
import MaintenanceScheduleSubTaskModel from './maintenanceScheduleSubTask'
import InventoryModel from './inventory'
class ComponentMaintenanceScheduleModel {
    maintenanceScheduleSubTaskModel = new MaintenanceScheduleSubTaskModel()
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
                await db.ComponentMaintenanceSchedule.add(dataToSave)
            } else {
                await db.ComponentMaintenanceSchedule.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.ComponentMaintenanceSchedule.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.ComponentMaintenanceSchedule.get() method to retrieve data by idIs
            const data = await db.ComponentMaintenanceSchedule.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.ComponentMaintenanceSchedule.where('id')
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
            // Use the db.ComponentMaintenanceSchedule.bulkAdd() method to save multiple data to the table
            await db.ComponentMaintenanceSchedule.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - inventory (InventoryInterface)
                - maintenanceScheduleSubTasks (where ComponentMaintenanceScheduleID)
        */
        if (data) {
            // inventory
            const inventory = await this.inventoryModel.getById(
                data.inventoryID,
            )
            // maintenanceScheduleSubTasks
            const maintenanceScheduleSubTasks =
                await this.maintenanceScheduleSubTaskModel.getByComponentMaintenanceScheduleId(
                    data.id,
                )
            return {
                ...data,
                inventory: inventory,
                maintenanceScheduleSubTasks: maintenanceScheduleSubTasks,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.ComponentMaintenanceSchedule.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.ComponentMaintenanceSchedule.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.ComponentMaintenanceSchedule.update(item.id, item)
            })
        } catch (error) {
            console.log('ComponentMaintenanceSchedule:',error)
        }
    }
}

export default ComponentMaintenanceScheduleModel
