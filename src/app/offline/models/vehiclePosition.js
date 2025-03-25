import dayjs from 'dayjs'
import db from './db'
import GeoLocationModel from './geoLocation'

class VehiclePositionModel {
    geoLocationModel = new GeoLocationModel()
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
            let vpos = await this.getById(id)
            if (!vpos) {
                await db.VehiclePosition.add(dataToSave)
            } else {
                await db.VehiclePosition.update(id, dataToSave)
            }
            vpos = await this.getById(id)
            return vpos
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.VehiclePosition.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.VehiclePosition.get() method to retrieve data by idIs
            const data = await db.VehiclePosition.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.VehiclePosition.where('id')
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                data.map(async (d) => {
                    const dataWithRelationships = await this.addRelationships(d)
                    return dataWithRelationships
                }),
            )
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getByVehicleId(vehicleID) {
        try {
            const data = await db.VehiclePosition.where('vehicleID')
                .equals(`${vehicleID}`)
                .toArray()
            const updatedData = Promise.all(
                data.map(async (d) => {
                    const dataWithRelationships = await this.addRelationships(d)
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
            // Use the db.VehiclePosition.bulkAdd() method to save multiple data to the table
            await db.VehiclePosition.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // geoLocationID
            const geoLocation = await this.geoLocationModel.getById(
                data.geoLocationID,
            )

            return {
                ...data,
                geoLocation: geoLocation,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.VehiclePosition.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.VehiclePosition.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.VehiclePosition.update(item.id, item)
            })
        } catch (error) {
            console.log('VehiclePosition:',error)
        }
    }
}

export default VehiclePositionModel
