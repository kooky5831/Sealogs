import dayjs from 'dayjs'
import db from './db'
import TripReport_LogBookEntrySectionModel from './tripReport_LogBookEntrySection'

class DangerousGoodsRecordModel {
    tripReportModel = new TripReport_LogBookEntrySectionModel()
    async save(data) {
        try {
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.DangerousGoodsRecord.put() method to save data to the table
            await db.DangerousGoodsRecord.put({
                ...stringifiedData,
                __typename: 'DangerousGoodsRecord',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            const tripReport = await this.tripReportModel.getById(
                stringifiedData.logBookEntrySectionID,
            )
            if (tripReport) {
                let dangerousGoodsRecords =
                    tripReport?.dangerousGoodsRecords?.nodes
                const dangerousGoodsRecord = {
                    ...stringifiedData,
                    __typename: 'DangerousGoodsRecord',
                }
                if (dangerousGoodsRecords) {
                    dangerousGoodsRecords = [
                        ...dangerousGoodsRecords,
                        dangerousGoodsRecord,
                    ]
                } else {
                    dangerousGoodsRecords = [dangerousGoodsRecord]
                }
                await this.tripReportModel.update({
                    ...tripReport,
                    dangerousGoodsRecords: {
                        nodes: dangerousGoodsRecords,
                    },
                })
            }
            return stringifiedData
        } catch (error) {
            throw error
        }
    }
    async update(data) {
        try {
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.DangerousGoodsRecord.put() method to save data to the table
            await db.DangerousGoodsRecord.update(stringifiedData.id, {
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            const dgr = await db.DangerousGoodsRecord.get(stringifiedData.id)
            const tripReport = await this.tripReportModel.getById(
                dgr.logBookEntrySectionID,
            )
            if (tripReport) {
                let dangerousGoodsRecords =
                    tripReport?.dangerousGoodsRecords?.nodes
                dangerousGoodsRecords = dangerousGoodsRecords.map((item) =>
                    item.id === stringifiedData.id ? dgr : item,
                )
                await this.tripReportModel.update({
                    ...tripReport,
                    dangerousGoodsRecords: {
                        nodes: dangerousGoodsRecords,
                    },
                })
            }
            return stringifiedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.DangerousGoodsRecord.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.DangerousGoodsRecord.get() method to retrieve data by idIs
            const data = await db.DangerousGoodsRecord.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.DangerousGoodsRecord.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.DangerousGoodsRecord.bulkAdd() method to save multiple data to the table
            await db.DangerousGoodsRecord.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async delete(id) {
        try {
            const data = await db.DangerousGoodsRecord.delete(id)
            const tripReport = await this.tripReportModel.getById(
                stringifiedData.tripReport_LogBookEntrySectionID,
            )
            if (tripReport) {
                let dangerousGoodsRecords =
                    tripReport.dangerousGoodsRecords.nodes
                dangerousGoodsRecords = dangerousGoodsRecords.filter(
                    (item) => item.id !== id,
                )
                await this.tripReportModel.update({
                    ...tripReport,
                    dangerousGoodsRecords: {
                        nodes: dangerousGoodsRecords,
                    },
                })
            }
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.DangerousGoodsRecord.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.DangerousGoodsRecord.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.DangerousGoodsRecord.update(item.id, item)
            })
        } catch (error) {
            console.log('DangerousGoodsRecord:',error)
        }
    }
}

export default DangerousGoodsRecordModel
