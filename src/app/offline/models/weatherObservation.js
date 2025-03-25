import dayjs from 'dayjs'
import db from './db'
import GeoLocationModel from './geoLocation'
import WeatherForecastModel from './weatherForecast'
class WeatherObservationModel {
    geoLocationModel = new GeoLocationModel()
    forecastModel = new WeatherForecastModel()
    async save(data) {
        try {
            // Convert number properties to strings
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            // Use the db.WeatherObservation.put() method to save data to the table
            await db.WeatherObservation.put({
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            const observation = await this.getById(stringifiedData.id)
            return observation
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.WeatherObservation.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.WeatherObservation.get() method to retrieve data by idIs
            const data = await db.WeatherObservation.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const data = await db.WeatherObservation.where('id')
                .anyOf(ids)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getByLogBookEntryID(logBookEntryID) {
        try {
            const data = await db.WeatherObservation.where('logBookEntryID')
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
            // Use the db.WeatherObservation.bulkAdd() method to save multiple data to the table
            await db.WeatherObservation.bulkAdd(data)
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
            // forecastID
            const forecast = await this.forecastModel.getById(data.forecastID)
            return {
                ...data,
                geoLocation: geoLocation,
                forecast: forecast,
            }
        } else {
            return data
        }
    }
    async delete(data) {
        try {
            await db.WeatherObservation.delete(`${data.id}`)
            return true // or return a success message
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.WeatherObservation.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.WeatherObservation.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.WeatherObservation.update(item.id, item)
            })
        } catch (error) {
            console.log('WeatherObservation:',error)
        }
    }
}

export default WeatherObservationModel
