import dayjs from 'dayjs'
import db from './db'
// import BarCrossingChecklistModel from './barCrossingChecklist'
// import RiskRatingModel from './riskRating'
// import ConsequenceModel from './consequence'
// import LikelihoodModel from './likelihood'
// import TowingChecklistModel from './towingChecklist'
// import DangerousGoodsChecklistModel from './dangerousGoodsChecklist'
import MitigationStrategyModel from './mitigationStrategy'
class RiskFactorModel {
    // barCrossingChecklistModel = new BarCrossingChecklistModel()
    // riskRatingModel = new RiskRatingModel()
    // consequenceModel = new ConsequenceModel()
    // likelihoodModel = new LikelihoodModel()
    // towingChecklistModel = new TowingChecklistModel()
    // dangerousGoodsChecklistModel = new DangerousGoodsChecklistModel()
    mitigationStrategyModel = new MitigationStrategyModel()
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
                await db.RiskFactor.add(dataToSave)
            } else {
                await db.RiskFactor.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.RiskFactor.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.RiskFactor.get() method to retrieve data by idIs
            const data = await db.RiskFactor.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.RiskFactor.where('id')
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
            const response = await db.RiskFactor.where('vesselID')
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
    async getByTowingChecklistID(id) {
        try {
            const response = await db.RiskFactor.where('towingChecklistID')
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
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.RiskFactor.where(`${fieldName}`)
                .equals(`${fieldID}`)
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
            // Use the db.RiskFactor.bulkAdd() method to save multiple data to the table
            await db.RiskFactor.bulkAdd(data)
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
                    - riskRating (RiskRating)
                    - consequence (Consequence)
                    - likelihood (Likelihood)
                    - towingChecklist (towingChecklist)
                    - dangerousGoodsChecklist (DangerousGoodsChecklist)
                    - barCrossingChecklist (barCrossingChecklist)
                    - mitigationStrategy (MitigationStrategy, by ids)
        */
        if (data) {
            // riskRating
            // const riskRating = await this.riskRatingModel.getById(
            //     data.riskRatingID,
            // )
            // consequence
            // const consequence = await this.consequenceModel.getById(
            //     data.consequenceID,
            // )
            // likelihood
            // const likelihood = await this.likelihoodModel.getById(
            //     data.likelihoodID,
            // )
            // towingChecklist
            // const towingChecklist = await this.towingChecklistModel.getById(
            //     data.towingChecklistID,
            // )
            // dangerousGoodsChecklist
            // const dangerousGoodsChecklist =
            //     await this.dangerousGoodsChecklistModel.getById(
            //         data.dangerousGoodsChecklistID,
            //     )
            // barCrossingChecklist
            // const barCrossingChecklist =
            //     await this.barCrossingChecklistModel.getById(
            //         data.barCrossingChecklistID,
            //     )
            // mitigationStrategy
            const ids = data.mitigationStrategy.nodes.map((node) => node.id)
            let mitigationStrategy = []
            if (ids.length > 0) {
                mitigationStrategy =
                    await this.mitigationStrategyModel.getByIds(ids)
            }
            return {
                ...data,
                // riskRating: riskRating,
                // consequence: consequence,
                // likelihood: likelihood,
                // towingChecklist: towingChecklist,
                // dangerousGoodsChecklist: dangerousGoodsChecklist,
                // barCrossingChecklist: barCrossingChecklist,
                mitigationStrategy: { nodes: mitigationStrategy },
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.RiskFactor.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.RiskFactor.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.RiskFactor.update(item.id, item)
            })
        } catch (error) {
            console.log('RiskFactor:',error)
        }
    }
}

export default RiskFactorModel
