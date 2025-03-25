import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
import VehiclePositionModel from './vehiclePosition'

class VesselModel {
    logBookEntryModel = new LogBookEntryModel()
    positionsModel = new VehiclePositionModel()
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
                await db.Vessel.add(dataToSave)
            } else {
                await db.Vessel.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.Vessel.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.Vessel.get() method to retrieve data by idIs
            const data = await db.Vessel.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.Vessel.bulkAdd() method to save multiple data to the table
            await db.Vessel.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // logBookEntries
            const logBookEntries = await this.logBookEntryModel.getByVesselId(
                data.id,
            )
            // vehiclePositions
            const vehiclePositions = await this.positionsModel.getByVehicleId(
                data.id,
            )
            return {
                ...data,
                logBookEntries: { nodes: logBookEntries },
                vehiclePositions: { nodes: vehiclePositions },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.Vessel.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.Vessel.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.Vessel.update(item.id, item)
            })
        } catch (error) {
            console.log('Vessel:',error)
        }
    }
}

export default VesselModel
