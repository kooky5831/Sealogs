import dayjs from 'dayjs'
import db from './db'
import GeoLocationModel from './geoLocation'
// WeatherForecast
class WeatherForecastModel {
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
            // Use the db.WeatherForecast.put() method to save data to the table
            await db.WeatherForecast.put({
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            const forecast = await this.getById(stringifiedData.id)
            return forecast
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.WeatherForecast.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.WeatherForecast.get() method to retrieve data by idIs
            const data = await db.WeatherForecast.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.WeatherForecast.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getByLogBookEntryID(logBookEntryID) {
        try {
            const data = await db.WeatherForecast.where('logBookEntryID')
                .equals(`${logBookEntryID}`)
                .toArray()
            const dataWithRelationships = Promise.all(
                data.map(async (d) => {
                    const rel = await this.addRelationships(d)
                    return rel
                }),
            )
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.WeatherForecast.bulkAdd() method to save multiple data to the table
            await db.WeatherForecast.bulkAdd(data)
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
    async delete(data) {
        try {
            await db.WeatherForecast.delete(`${data.id}`)
            // Delete associated observations
            await db.WeatherObservation.where('forecastID')
                .equals(`${data.id}`)
                .delete()
            return true // or return a success message
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.WeatherForecast.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.WeatherForecast.update(id, data)
                return data
             }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.WeatherForecast.update(item.id, item)
            })
        } catch (error) {
            console.log('WeatherForecast:',error)
        }
    }
}

export default WeatherForecastModel
