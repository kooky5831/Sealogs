import dayjs from 'dayjs'
import db from './db'
import LogBookEntryModel from './logBookEntry'
import SeaLogsMemberModel from './seaLogsMember'
import CrewDutyModel from './crewDuty'

class CrewMembers_LogBookEntrySectionModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
    crewDutyModel = new CrewDutyModel()
    logBookEntryModel = new LogBookEntryModel()
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
                __typename: 'CrewMembers_LogBookEntrySection',
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let crew = await this.getById(id)
            if (!crew) {
                await db.CrewMembers_LogBookEntrySection.add(dataToSave)
            } else {
                await db.CrewMembers_LogBookEntrySection.update(id, dataToSave)
            }
            // Update logBookEntry section
            const logBookEntry = await this.logBookEntryModel.getById(
                stringifiedData.logBookEntryID,
            )
            if (logBookEntry) {
                let sections = logBookEntry.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\CrewMembers_LogBookEntrySection',
                    id: stringifiedData.id,
                    __typename: 'CrewMembers_LogBookEntrySection',
                }
                sections = [...sections, section]
                await this.logBookEntryModel.save({
                    ...logBookEntry,
                    logBookEntrySections: {
                        nodes: sections,
                    },
                })
            }
            crew = await this.getById(id)
            return crew
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.CrewMembers_LogBookEntrySection.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            const data = await db.CrewMembers_LogBookEntrySection.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const members = await db.CrewMembers_LogBookEntrySection.where('id')
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                members.map(async (data) => {
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
            // Use the db.CrewMembers_LogBookEntrySection.bulkAdd() method to save multiple data to the table
            await db.CrewMembers_LogBookEntrySection.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    // async deleteById(id) {
    //     try {
    //         await db.CrewMembers_LogBookEntrySection.delete(`${id}`)
    //         // Delete from logBookEntry section
    //         return true // or return a success message
    //     } catch (error) {
    //         throw error
    //     }
    // }
    async delete(data) {
        try {
            await db.CrewMembers_LogBookEntrySection.delete(`${data.id}`)
            // Delete from logBookEntry section
            const logBookEntryID = data.logBookEntryID
            const logBookEntry =
                await this.logBookEntryModel.getById(logBookEntryID)
            const sections = logBookEntry.logBookEntrySections.nodes
            const updatedSections = sections.filter(
                (section) => section.id !== data.id,
            )
            await this.logBookEntryModel.save({
                ...logBookEntry,
                logBookEntrySections: {
                    nodes: updatedSections,
                },
            })
            return true // or return a success message
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        if (data) {
            // crewMemberID
            const crewMember = await this.seaLogsMemberModel.getById(
                data.crewMemberID,
            )
            // dutyPerformedID
            const dutyPerformed = await this.crewDutyModel.getById(
                data.dutyPerformedID,
            )
            return {
                ...data,
                crewMember: crewMember,
                dutyPerformed: dutyPerformed,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id) {
                let data = await db.CrewMembers_LogBookEntrySection.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.CrewMembers_LogBookEntrySection.update(id, data);
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.CrewMembers_LogBookEntrySection.update(item.id, item)
            })
        } catch (error) {
            console.log('CrewMembers_LogBookEntrySection:',error)
        }
    }
}

export default CrewMembers_LogBookEntrySectionModel
