import dayjs from 'dayjs'
import db from './db'
import Dexie from 'dexie'

class SectionMemberCommentModel {
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
                __typename: 'SectionMemberComment',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let comment = await this.getById(id)
            if (!comment) {
                await db.SectionMemberComment.add(dataToSave)
            } else {
                await db.SectionMemberComment.update(id, dataToSave)
            }
            comment = await this.getById(id)
            return comment
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.SectionMemberComment.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getOne() {
        try {
            const data = await db.SectionMemberComment.toArray()
            if (data.length > 0) {
                data?.sort((a, b) => {
                    return +b.id - +a.id
                })
                return data[0]
            }
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.SectionMemberComment.get() method to retrieve data by idIs
            const data = await db.SectionMemberComment.get(`${id}`)
            return data
        } catch (error) {
            throw error
        }
    }
    async getByLogBookEntrySectionID(logBookEntrySectionID) {
        try {
            const data = await db.SectionMemberComment.where(
                'logBookEntrySectionID',
            )
                .equals(`${logBookEntrySectionID}`)
                .toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getPreviousComments(sectionIDs = []) {
        try {
            if (sectionIDs.length === 0) {
                return []
            }

            const data = await db
                .table('SectionMemberComment')
                .where('logBookEntrySectionID')
                .anyOf(sectionIDs)
                .and((item) => item.commentType === 'Section')
                .and((item) => item.comment !== null)
                .and((item) => item.hideComment === false)
                .toArray()

            /* .where('logBookEntrySectionID')
                .anyOf(sectionIDs)
                .and(
                    (item) =>
                        item.commentType === 'Section' &&
                        item.comment !== null &&
                        item.hideComment === false,
                ) */

            return data
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.SectionMemberComment.bulkAdd() method to save multiple data to the table
            await db.SectionMemberComment.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.SectionMemberComment.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.SectionMemberComment.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.SectionMemberComment.update(item.id, item)
            })
        } catch (error) {
            console.log('SectionMemberComment:',error)
        }
    }
}

export default SectionMemberCommentModel
