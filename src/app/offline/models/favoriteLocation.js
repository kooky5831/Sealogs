import dayjs from 'dayjs'
import db from './db'

class FavoriteLocationModel {
    async save(data) {
        try {
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.FavoriteLocation.put() method to save data to the table
            var favLocation = []
            if (
                +stringifiedData.geoLocationID > 0 &&
                +stringifiedData.memberID > 0
            ) {
                favLocation = await db.FavoriteLocation.where('geoLocationID')
                    .equals(`${stringifiedData.geoLocationID}`)
                    .and((favLocation) =>
                        favLocation
                            .where('memberID')
                            .equals(`${stringifiedData.memberID}`),
                    )
            }
            if (favLocation.length > 0) {
                await db.FavoriteLocation.update(favLocation[0].id, {
                    ...stringifiedData,
                    usage: favLocation[0].usage + 1,
                    __typename: 'FavoriteLocation',
                    idbCRUD: 'Update',
                    idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                })
            } else {
                await db.FavoriteLocation.put({
                    ...stringifiedData,
                    __typename: 'FavoriteLocation',
                    idbCRUD: 'Update',
                    idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                })
            }
            const faveLocs = await this.getById(stringifiedData.id)
            return faveLocs
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.FavoriteLocation.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.FavoriteLocation.get() method to retrieve data by idIs
            const data = await db.FavoriteLocation.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.FavoriteLocation.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getByMemberID(memberID) {
        try {
            const data = await db.FavoriteLocation.where('memberID')
                .equals(`${memberID}`)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.FavoriteLocation.bulkAdd() method to save multiple data to the table
            await db.FavoriteLocation.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.FavoriteLocation.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.FavoriteLocation.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.WeatherTide.update(item.id, item)
            })
        } catch (error) {
            console.log('WeatherTide:',error)
        }
    }
}

export default FavoriteLocationModel
