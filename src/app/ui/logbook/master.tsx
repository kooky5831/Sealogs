'use client'
import { classes } from '@/app/components/GlobalClasses'
import {
    CrewMembers_LogBookEntrySection,
    GET_LOGBOOK_ENTRY_BY_ID,
} from '@/app/lib/graphQL/query'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import { useLazyQuery } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Select from 'react-select'

export default function MasterList({
    master,
    masterTerm,
    setMaster,
    crewMembers,
    offline = false,
    edit_logBookEntry = false,
}: {
    master: any
    masterTerm: string
    setMaster: any
    crewMembers: any
    offline?: boolean
    edit_logBookEntry?: boolean
}) {
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const [memberList, setMemberList] = useState<any>([])

    const [getMembers] = useLazyQuery(CrewMembers_LogBookEntrySection, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let data = response.readCrewMembers_LogBookEntrySections.nodes
            const crewMembers = data.map((member: any) => {
                return {
                    label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                    value: member.crewMember.id,
                }
            })
            setMemberList(crewMembers)
        },
        onError: (error: any) => {
            console.error('CrewMembers_LogBookEntrySection error', error)
        },
    })
    const handleSetLogbook = async (logbook: any) => {
        const sections = logbook.logBookEntrySections.nodes.filter(
            (node: any) => {
                return (
                    node.className ===
                    'SeaLogs\\CrewMembers_LogBookEntrySection'
                )
            },
        )
        if (sections) {
            const sectionIDs = sections.map((section: any) => section.id)
            if (sectionIDs?.length > 0) {
                if (offline) {
                    const lbCrewModel =
                        new CrewMembers_LogBookEntrySectionModel()
                    let data = await lbCrewModel.getByIds(sectionIDs)
                    const crewMembers = data.map((member: any) => {
                        return {
                            label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                            value: member.crewMember.id,
                        }
                    })
                    setMemberList(crewMembers)
                } else {
                    getMembers({
                        variables: {
                            filter: { id: { in: sectionIDs } },
                        },
                    })
                }
            }
        }
    }

    const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            if (data) {
                handleSetLogbook(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntry error', error)
        },
    })

    const loadLogBookEntry = async () => {
        if (offline) {
            const logbookEntryModel = new LogBookEntryModel()
            const logbook = await logbookEntryModel.getById(logentryID)
            handleSetLogbook(logbook)
        } else {
            await queryLogBookEntry({
                variables: {
                    logbookEntryId: +logentryID,
                },
            })
        }
    }

    useEffect(() => {
        loadLogBookEntry()
    }, [crewMembers])

    return (
        <div className="flex flex-col items-start dark:text-white w-full lg:mb-0 md:mb-0">
            <label className={`${classes.label} block`}>{masterTerm}</label>
            <Select
                closeMenuOnSelect={true}
                isDisabled={!edit_logBookEntry}
                options={memberList}
                menuPlacement="top"
                defaultValue={
                    master.firstName != null
                        ? {
                              label: master.firstName + ' ' + master.surname,
                              value: master.id,
                          }
                        : null
                }
                onChange={setMaster}
                placeholder={`Select ${masterTerm}`}
                className={`${classes.selectMain} !w-64`}
                classNames={{
                    control: () => classes.selectControl + ' !py-1',
                    singleValue: () => classes.selectSingleValue,
                    dropdownIndicator: () => classes.selectDropdownIndicator,
                    menu: () => classes.selectMenu,
                    indicatorSeparator: () => classes.selectIndicatorSeparator,
                    option: () => classes.selectOption,
                    clearIndicator: () => '!py-0',
                    valueContainer: () => '!py-0',
                    input: () => '!py-1',
                }}
            />
        </div>
    )
}
