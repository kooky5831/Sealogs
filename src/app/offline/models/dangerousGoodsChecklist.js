import dayjs from 'dayjs'
import db from './db'
import RiskFactorModel from './riskFactor'
import TripReport_StopModel from './tripReport_Stop'
class DangerousGoodsChecklistModel {
    riskFactorModel = new RiskFactorModel()
    tripReport_StopModel = new TripReport_StopModel()
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
                await db.DangerousGoodsChecklist.add(dataToSave)
            } else {
                await db.DangerousGoodsChecklist.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.DangerousGoodsChecklist.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.DangerousGoodsChecklist.get() method to retrieve data by idIs
            const data = await db.DangerousGoodsChecklist.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.DangerousGoodsChecklist.where('id')
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
    async getByVesselID(id) {
        try {
            const response = await db.DangerousGoodsChecklist.where('vesselID')
                .equals(`${id}`)
                .toArray()
            return response // I did not add relationships here to avoid infinte loop
            /* const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData */
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.DangerousGoodsChecklist.bulkAdd() method to save multiple data to the table
            await db.DangerousGoodsChecklist.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Index
                    - vesselID
                - Relationship
                    - tripReport_Stop (TripReport_Stop)
                    - riskFactors (RiskFactor, dangerousGoodsChecklistID)
        */
        if (data) {
            // riskFactors
            const riskFactors = await this.riskFactorModel.getByFieldID(
                'dangerousGoodsChecklistID',
                data.dangerousGoodsChecklistID,
            )
            // tripReport_StopID
            const tripReport_Stop =
                await this.tripReport_StopModel.getByFieldID(
                    'tripReport_StopID',
                    data.tripReport_StopID,
                )
            return {
                ...data,
                riskFactors: riskFactors,
                tripReport_Stop: tripReport_Stop,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.DangerousGoodsChecklist.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.DangerousGoodsChecklist.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.DangerousGoodsChecklist.update(item.id, item)
            })
        } catch (error) {
            console.log('DangerousGoodsChecklist:',error)
        }
    }
}

export default DangerousGoodsChecklistModel
