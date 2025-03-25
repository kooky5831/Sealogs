import dayjs from 'dayjs'
import db from './db'
import GeoLocationModel from './geoLocation'
import VehiclePositionModel from './vehiclePosition'
import VesselModel from './vessel'
class CGEventMissionModel {
    geoLocationModel = new GeoLocationModel()
    VehiclePositionModel = new VehiclePositionModel()
    vesselModel = new VesselModel()
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
                await db.CGEventMission.add(dataToSave)
            } else {
                await db.CGEventMission.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.CGEventMission.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.CGEventMission.get() method to retrieve data by idIs
            const data = await db.CGEventMission.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.CGEventMission.where('id')
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
            // Use the db.CGEventMission.bulkAdd() method to save multiple data to the table
            await db.CGEventMission.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
            - Relationships:
                - currentLocation (GeoLocation)
                - vesselPosition (VehiclePositionInterface)
                - vessel (VesselInterface)
                - vesselRescue (EventType_VesselRescue) // I did not add this relationship to avoid infinite loop
                - personRescue (EventType_PersonRescue) // I did not add this relationship to avoid infinite loop

        */
        if (data) {
            // currentLocationID
            const currentLocation = await this.geoLocationModel.getById(
                data.currentLocationID,
            )
            // vesselPositionID
            const vesselPosition = await this.VehiclePositionModel.getById(
                data.vesselPositionID,
            )
            // vesselID
            const vessel = await this.vesselModel.getById(data.vesselID)
            return {
                ...data,
                currentLocation: currentLocation,
                vesselPosition: vesselPosition,
                vessel: vessel,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.CGEventMission.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CGEventMission.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CGEventMission.update(item.id, item)
            })
        } catch (error) {
            console.log('CGEventMission:',error)
        }
    }
}

export default CGEventMissionModel
