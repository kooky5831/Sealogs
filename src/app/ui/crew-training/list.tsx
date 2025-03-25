'use client'
import {
    TRAINING_SESSIONS,
    READ_TRAINING_SESSION_DUES,
} from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import Link from 'next/link'
import { List } from '../skeletons'
import CustomPagination from '@/app/components/Pagination'
import { TableWrapper, SeaLogsButton } from '@/app/components/Components'
import Filter from '@/app/components/Filter'
import { classes } from '@/app/components/GlobalClasses'
import { GetTrainingSessionStatus } from '@/app/lib/actions'
import { isEmpty } from 'lodash'
import { formatDate } from '@/app/helpers/dateHelper'

const CrewTrainingList = ({
    memberId = 0,
    vesselId = 0,
}: {
    memberId?: number
    vesselId?: number
}) => {
    const limit = 100
    const [isLoading, setIsLoading] = useState(true)
    const [pageInfo, setPageInfo] = useState({
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const [trainingList, setTrainingList] = useState([] as any)
    const [trainingSessionDues, setTrainingSessionDues] = useState([] as any)
    const [page, setPage] = useState(0)
    const [filter, setFilter] = useState({})
    const [vesselIdOptions, setVesselIdOptions] = useState([] as any)
    const [trainingTypeIdOptions, setTrainingTypeIdOptions] = useState(
        [] as any,
    )
    const [trainerIdOptions, setTrainerIdOptions] = useState([] as any)
    const [crewIdOptions, setCrewIdOptions] = useState([] as any)

    const [queryTrainingList, { loading: queryTrainingListLoading }] =
        useLazyQuery(TRAINING_SESSIONS, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTrainingSessions.nodes
                const vesselIDs = Array.from(
                    new Set(data.map((item: any) => item.vessel.id)),
                ).filter((id: any) => +id !== 0)
                const trainingTypeIDs = Array.from(
                    new Set(
                        data.flatMap((item: any) =>
                            item.trainingTypes.nodes.map((t: any) => t.id),
                        ),
                    ),
                )
                const trainerIDs = Array.from(
                    new Set(data.map((item: any) => item.trainerID)),
                ).filter((id: any) => +id !== 0)
                const memberIDs = Array.from(
                    new Set(
                        data.flatMap((item: any) =>
                            item.members.nodes.map((t: any) => t.id),
                        ),
                    ),
                )

                if (data) {
                    setTrainingList(data)
                    setVesselIdOptions(vesselIDs)
                    setTrainingTypeIdOptions(trainingTypeIDs)
                    setTrainerIdOptions(trainerIDs)
                    setCrewIdOptions(memberIDs)
                }
                setPageInfo(response.readTrainingSessions.pageInfo)
            },
            onError: (error: any) => {
                console.error('queryTrainingList error', error)
            },
        })
    const loadTrainingList = async (
        startPage: number = 0,
        searchFilter: any = { ...filter },
    ) => {
        await queryTrainingList({
            variables: {
                filter: searchFilter,
                offset: startPage * limit,
                limit: limit,
            },
        })
    }
    const handleNavigationClick = (newPage: any) => {
        if (newPage < 0 || newPage === page) return
        setPage(newPage)
        loadTrainingSessionDues(filter)
        loadTrainingList(newPage, filter)
    }
    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }

        if (type === 'vessel') {
            if (data) {
                searchFilter.vesselID = { eq: +data.value }
            } else {
                delete searchFilter.vesselID
            }
        }

        if (type === 'trainingType') {
            if (data) {
                searchFilter.trainingTypes = { id: { contains: +data.value } }
            } else {
                delete searchFilter.trainingTypes
            }
        }
        if (type === 'trainer') {
            if (data) {
                searchFilter.trainer = { id: { eq: +data.value } }
            } else {
                delete searchFilter.trainer
            }
        }
        if (type === 'member') {
            if (data) {
                searchFilter.members = { id: { contains: +data.value } }
            } else {
                delete searchFilter.members
            }
        }
        if (type === 'dateRange') {
            if (data.startDate && data.endDate) {
                searchFilter.date = {
                    gte: data.startDate,
                    lte: data.endDate,
                }
            } else {
                delete searchFilter.date
            }
        }
        setFilter(searchFilter)
        loadTrainingSessionDues(searchFilter)
        loadTrainingList(0, searchFilter)
    }
    const [
        readTrainingSessionDues,
        { loading: readTrainingSessionDuesLoading },
    ] = useLazyQuery(READ_TRAINING_SESSION_DUES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingSessionDues.nodes
            if (data) {
                // Filter out crew members who are no longer assigned to the vessel.
                const filteredData = data.filter((item: any) =>
                    item.vessel.seaLogsMembers.nodes.some((m: any) => {
                        return m.id === item.memberID
                    }),
                )
                const dueWithStatus = filteredData.map((due: any) => {
                    return { ...due, status: GetTrainingSessionStatus(due) }
                })
                // Return only due within 7 days and overdue
                const filteredDueWithStatus = dueWithStatus.filter(
                    (item: any) => {
                        return (
                            item.status.isOverdue ||
                            (item.status.isOverdue === false &&
                                item.status.dueWithinSevenDays === true)
                        )
                    },
                )
                const groupedDues = filteredDueWithStatus.reduce(
                    (acc: any, due: any) => {
                        const key = `${due.vesselID}-${due.trainingTypeID}-${due.dueDate}`
                        if (!acc[key]) {
                            acc[key] = {
                                id: due.id,
                                vesselID: due.vesselID,
                                vessel: due.vessel,
                                trainingTypeID: due.trainingTypeID,
                                trainingType: due.trainingType,
                                dueDate: due.dueDate,
                                status: due.status,
                                members: [],
                            }
                        }
                        acc[key].members.push(due.member)
                        return acc
                    },
                    {},
                )

                const mergedDues = Object.values(groupedDues).map(
                    (group: any) => {
                        const mergedMembers = group.members.reduce(
                            (acc: any, member: any) => {
                                const existingMember = acc.find(
                                    (m: any) => m.id === member.id,
                                )
                                if (existingMember) {
                                    existingMember.firstName = member.firstName
                                    existingMember.surname = member.surname
                                } else {
                                    acc.push(member)
                                }
                                return acc
                            },
                            [],
                        )
                        return {
                            id: group.id,
                            vesselID: group.vesselID,
                            vessel: group.vessel,
                            trainingTypeID: group.trainingTypeID,
                            trainingType: group.trainingType,
                            status: group.status,
                            dueDate: group.dueDate,
                            members: mergedMembers,
                        }
                    },
                )
                setTrainingSessionDues(mergedDues)
            }
        },
        onError: (error: any) => {
            console.error('readTrainingSessionDues error', error)
        },
    })
    const loadTrainingSessionDues = async (filter: any) => {
        const dueFilter: any = {}
        if (memberId > 0) {
            dueFilter.memberID = { eq: +memberId }
        }
        if (vesselId > 0) {
            dueFilter.vesselID = { eq: +vesselId }
        }
        if (filter.vesselID) {
            dueFilter.vesselID = filter.vesselID
        }
        if (filter.trainingTypes) {
            dueFilter.trainingTypeID = { eq: filter.trainingTypes.id.contains }
        }
        if (filter.members) {
            dueFilter.memberID = { eq: filter.members.id.contains }
        }
        if (filter.date) {
            dueFilter.dueDate = filter.date
        } else {
            dueFilter.dueDate = { ne: null }
        }
        await readTrainingSessionDues({
            variables: {
                filter: dueFilter,
            },
        })
    }

    useEffect(() => {
        if (isLoading) {
            const f: { members?: any } = { ...filter }
            if (+memberId > 0) {
                f.members = { id: { contains: +memberId } }
            }
            setFilter(f)
            loadTrainingSessionDues(f)
            loadTrainingList(0, f)
            setIsLoading(false)
        }
    }, [isLoading])

    return (
        <div className="w-ful">
            {memberId === 0 && vesselId === 0 && (
                <div className="flex justify-end items-center flex-row gap-2">
                    <SeaLogsButton
                        link={`/training-type`}
                        text="Training Schedules / types"
                        color="slblue"
                        type="text"
                        icon="category"
                        className="hidden lg:flex"
                    />
                    <SeaLogsButton
                        link={`/crew-training/create`}
                        text="Record A Training"
                        color="slblue"
                        type="primary"
                        icon="crew_cap"
                    />
                </div>
            )}
            <Filter
                onChange={handleFilterOnChange}
                vesselIdOptions={vesselIdOptions}
                trainingTypeIdOptions={trainingTypeIdOptions}
                trainerIdOptions={trainerIdOptions}
                memberIdOptions={crewIdOptions}
            />
            {queryTrainingListLoading || readTrainingSessionDuesLoading ? (
                <List />
            ) : (
                <>
                    <TrainingList
                        trainingList={trainingList}
                        memberId={memberId}
                        trainingSessionDues={trainingSessionDues}
                    />
                    <CustomPagination
                        page={page}
                        limit={limit}
                        visiblePageCount={5}
                        {...pageInfo}
                        onClick={(newPage: number) =>
                            handleNavigationClick(newPage)
                        }
                    />
                </>
            )}
        </div>
    )
}

export default CrewTrainingList

export const TrainingList = ({
    trainingList,
    trainingSessionDues,
    memberId = 0,
    isVesselView = false,
}: any) => {
    return (
        <>
            {trainingSessionDues?.length > 0 && (
                <div className="w-full shadow-md border border-slorange-1000 bg-slorange-300 my-4 rounded-lg">
                    <TableWrapper headings={[]}>
                        <tr className="bg-slorange-100">
                            <td className="text-left p-2" colSpan={4}>
                                <label
                                    className={`${classes.label} text-slorange-1000 font-semibold`}>
                                    Overdue
                                </label>
                            </td>
                        </tr>
                        {trainingSessionDues?.length > 0
                            ? trainingSessionDues?.map(
                                  (due: any) =>
                                      due.dueDate && (
                                          <tr
                                              key={due.id}
                                              className={`group border-b dark:border-slblue-400 hover:bg-white bg-slorange-100`}>
                                              <td className="p-2 align-top lg:align-middle items-center text-left border-y md:border-0 border-slblue-100">
                                                  {due.trainingType.title}
                                                  {isVesselView == false && (
                                                      <span className="ml-1 inline-block md:hidden">
                                                          :&nbsp;
                                                          {due.vessel.title}
                                                      </span>
                                                  )}
                                                  <div className="flex flex-col gap-2 md:hidden">
                                                      <div className="flex items-center max-w-100 whitespace-normal flex-wrap gap-2 ">
                                                          {due.members.map(
                                                              (
                                                                  member: any,
                                                                  index: number,
                                                              ) => {
                                                                  if (
                                                                      index < 3
                                                                  ) {
                                                                      return !isVesselView ? (
                                                                          <div
                                                                              key={
                                                                                  member.id
                                                                              }
                                                                              className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 outline-none text-nowrap">
                                                                              {`${member.firstName ?? ''} ${member.surname ?? ''}`}
                                                                          </div>
                                                                      ) : (
                                                                          <div
                                                                              key={
                                                                                  member.id
                                                                              }
                                                                              className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 outline-none text-nowrap">
                                                                              {`${member.firstName ?? ''}`}{' '}
                                                                          </div>
                                                                      )
                                                                  }
                                                                  if (
                                                                      index ===
                                                                      3
                                                                  ) {
                                                                      return (
                                                                          <DialogTrigger
                                                                              key={
                                                                                  member.id
                                                                              }>
                                                                              <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none ">
                                                                                  +{' '}
                                                                                  {due
                                                                                      .members
                                                                                      .length -
                                                                                      2}{' '}
                                                                                  more
                                                                              </Button>
                                                                              <Popover>
                                                                                  <div className="p-0 w-64 max-h-full bg-slblue-100 rounded text-slblue-800">
                                                                                      <span>
                                                                                          {due.members
                                                                                              .slice(
                                                                                                  2,
                                                                                              )
                                                                                              .map(
                                                                                                  (
                                                                                                      remainingMember: any,
                                                                                                  ) => (
                                                                                                      <div
                                                                                                          key={
                                                                                                              remainingMember.id
                                                                                                          }
                                                                                                          className="flex cursor-pointer hover:bg-slblue-200 items-center overflow-auto">
                                                                                                          <div className="ps-3 py-2">
                                                                                                              <div className="text-sm">
                                                                                                                  {`${member.firstName ?? ''} ${member.surname ?? ''}`}
                                                                                                              </div>
                                                                                                          </div>
                                                                                                      </div>
                                                                                                  ),
                                                                                              )}
                                                                                      </span>
                                                                                  </div>
                                                                              </Popover>
                                                                          </DialogTrigger>
                                                                      )
                                                                  }
                                                              },
                                                          )}
                                                      </div>
                                                      <div
                                                          className={`${due.status?.class} !p-2 text-nowrap`}>
                                                          {due.status?.label}
                                                      </div>
                                                  </div>
                                              </td>
                                              {isVesselView == false && (
                                                  <td className="hidden md:table-cell p-2 align-top lg:align-middle items-center text-left">
                                                      {due.vessel.title}
                                                  </td>
                                              )}
                                              <td className="hidden lg:table-cell p-2 min-w-2/4 text-left">
                                                  <div className="flex items-center max-w-full flex-wrap">
                                                      {due.members.map(
                                                          (
                                                              member: any,
                                                              index: number,
                                                          ) => {
                                                              if (index < 3) {
                                                                  return !isVesselView ? (
                                                                      <div
                                                                          key={
                                                                              member.id
                                                                          }
                                                                          className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none text-nowrap ">
                                                                          {`${member.firstName ?? ''} ${member.surname ?? ''}`}
                                                                      </div>
                                                                  ) : (
                                                                      <div
                                                                          key={
                                                                              member.id
                                                                          }
                                                                          className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none text-nowrap ">
                                                                          {`${member.firstName ?? ''} ${member.surname ?? ''}`}{' '}
                                                                      </div>
                                                                  )
                                                              }
                                                              if (index === 3) {
                                                                  return (
                                                                      <DialogTrigger
                                                                          key={
                                                                              member.id
                                                                          }>
                                                                          <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none ">
                                                                              +{' '}
                                                                              {due
                                                                                  .members
                                                                                  .length -
                                                                                  2}{' '}
                                                                              more
                                                                          </Button>
                                                                          <Popover>
                                                                              <div className="p-0 w-64 max-h-full bg-slblue-100 rounded text-slblue-800">
                                                                                  <span>
                                                                                      {due.members
                                                                                          .slice(
                                                                                              2,
                                                                                          )
                                                                                          .map(
                                                                                              (
                                                                                                  remainingMember: any,
                                                                                              ) => (
                                                                                                  <div
                                                                                                      key={
                                                                                                          remainingMember.id
                                                                                                      }
                                                                                                      className="flex cursor-pointer hover:bg-slblue-200 items-center overflow-auto">
                                                                                                      <div className="ps-3 py-2">
                                                                                                          <div className="text-sm">
                                                                                                              {`${member.firstName ?? ''} ${member.surname ?? ''}`}
                                                                                                          </div>
                                                                                                      </div>
                                                                                                  </div>
                                                                                              ),
                                                                                          )}
                                                                                  </span>
                                                                              </div>
                                                                          </Popover>
                                                                      </DialogTrigger>
                                                                  )
                                                              }
                                                          },
                                                      )}
                                                  </div>
                                              </td>
                                              <td className="hidden md:table-cell p-2 text-left">
                                                    <div className="flex items-center max-w-full flex-wrap">
                                                        <div
                                                            className={`${due.status?.class} !p-2 text-nowrap`}>
                                                            {due.status?.label}
                                                        </div>
                                                  </div>
                                              </td>
                                          </tr>
                                      ),
                              )
                            : ''}
                    </TableWrapper>
                </div>
            )}

            <div className="shadow-sm w-full border border-slblue-100 rounded-lg my-4">
                <TableWrapper headings={[]}>
                    <tr>
                        <td className="text-left p-3 w-100">
                            <label
                                className={`${classes.label} text-slgreen-1000 font-semibold hidden md:block !w-auto`}>
                                Date completed
                            </label>
                            <label
                                className={`${classes.label} text-slgreen-1000 font-semibold block md:hidden !w-auto`}>
                                Training/drills completed
                            </label>
                        </td>
                        <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                            <label className={`${classes.label}`}>
                                Training/drill
                            </label>
                        </td>
                        {isVesselView == false && (
                            <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                                <label className={`${classes.label} !w-full`}>
                                    Where
                                </label>
                            </td>
                        )}
                        <td className="hidden lg:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                            <label className={`${classes.label}`}>Who</label>
                        </td>
                        <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                            <label className={`${classes.label}`}>
                                Trainer
                            </label>
                        </td>
                    </tr>
                    {trainingList?.length > 0 ? (
                        trainingList
                            .filter(
                                (training: any) =>
                                    training.trainingTypes.nodes.length > 0 &&
                                    training.trainer?.id > 0,
                            )
                            .map((training: any) => (
                                <tr
                                    key={training.id}
                                    className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="p-2 align-top lg:align-middle items-center text-left border-y md:border-0 border-slblue-100">
                                        <Link
                                            href={`/crew-training/info?id=${training.id}`}
                                            className=" group-hover:text-sllightblue-100">
                                            {formatDate(training.date)}
                                        </Link>
                                        <div className="flex flex-wrap md:hidden">
                                            {training.trainingTypes.nodes
                                                ? training.trainingTypes.nodes.map(
                                                      (item: any) => (
                                                          <div key={item.id}>
                                                              {item.title}
                                                          </div>
                                                      ),
                                                  )
                                                : ''}
                                            {isVesselView == false && (
                                                <span className="inline-block md:hidden">
                                                    :&nbsp;
                                                    {training.vessel.title
                                                        ? training.vessel.title
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap lg:hidden -pl-2">
                                            {training.members.nodes.map(
                                                (
                                                    member: any,
                                                    index: number,
                                                ) => {
                                                    if (index < 2) {
                                                        return !isVesselView ? (
                                                            <div
                                                                key={member.id}
                                                                className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none ">
                                                                {`${member.firstName ?? ''} ${member.surname ?? ''}`} 
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={member.id}
                                                                className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none ">
                                                                {`${member.firstName ?? ''}`}{' '}
                                                            </div>
                                                        )
                                                    }
                                                    if (index === 2) {
                                                        return (
                                                            <DialogTrigger
                                                                key={member.id}>
                                                                <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none ">
                                                                    +{' '}
                                                                    {training
                                                                        .members
                                                                        .nodes
                                                                        .length -
                                                                        2}{' '}
                                                                    more
                                                                </Button>
                                                                <Popover>
                                                                    <div className="p-0 w-64 max-h-full bg-sllightblue-100 rounded text-sllightblue-800">
                                                                        <span>
                                                                            {training.members.nodes
                                                                                .slice(
                                                                                    2,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        remainingMember: any,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                remainingMember.id
                                                                                            }
                                                                                            className="flex cursor-pointer hover:bg-sllightblue-200 items-center overflow-auto">
                                                                                            <div className="ps-3 py-2">
                                                                                                <div className="text-sm">
                                                                                                    {`${remainingMember.firstName ?? ''} ${remainingMember.surname ?? ''}`}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                        </span>
                                                                    </div>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )
                                                    }
                                                },
                                            )}
                                        </div>
                                        <div className="flex flex-row gap-2 md:hidden items-baseline">
                                            <label
                                                className={`${classes.label} !w-auto`}>
                                                Trainer:
                                            </label>
                                            {!isVesselView ? (
                                                <>
                                                    {training.trainer?.id ===
                                                    +memberId
                                                        ? 'You'
                                                        : `${(training.trainer && training.trainer.firstName) || ''} ${(training.trainer && training.trainer.surname) || ''}`}
                                                </>
                                            ) : (
                                                <>
                                                    {training.trainer?.id ===
                                                    +memberId
                                                        ? 'You'
                                                        : `${(training.trainer && training.trainer.firstName) || ''} ${(training.trainer && training.trainer.surname) || ''}`}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-2 align-top lg:align-middle items-center text-left">
                                        {training.trainingTypes.nodes
                                            ? training.trainingTypes.nodes.map(
                                                  (item: any) => (
                                                      <div key={item.id}>
                                                          {item.title}
                                                      </div>
                                                  ),
                                              )
                                            : ''}
                                    </td>
                                    {isVesselView == false && (
                                        <td className="hidden md:table-cell p-2 align-top lg:align-middle items-center text-left">
                                            {training.vessel.title
                                                ? training.vessel.title
                                                : ''}
                                        </td>
                                    )}
                                    <td className="hidden lg:table-cell p-2 align-top lg:align-middle items-center text-left">
                                        <div className="flex flex-wrap">
                                            {training.members.nodes.map(
                                                (
                                                    member: any,
                                                    index: number,
                                                ) => {
                                                    if (index < 2) {
                                                        return !isVesselView ? (
                                                            <div
                                                                key={member.id}
                                                                className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 text-nowrap outline-none dark:text-sldarkblue-800">
                                                                {`${member.firstName ?? ''} ${member.surname ?? ''}`}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={member.id}
                                                                className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 text-nowrap outline-none dark:text-sldarkblue-800">
                                                                {`${member.firstName ?? ''} ${member.surname ?? ''}`}{' '}
                                                            </div>
                                                        )
                                                    }
                                                    if (index === 2) {
                                                        return (
                                                            <DialogTrigger
                                                                key={member.id}>
                                                                <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none dark:text-sldarkblue-800">
                                                                    +{' '}
                                                                    {training
                                                                        .members
                                                                        .nodes
                                                                        .length -
                                                                        2}{' '}
                                                                    more
                                                                </Button>
                                                                <Popover>
                                                                    <div className="p-0 w-64 max-h-full bg-sllightblue-100 rounded text-sllightblue-800">
                                                                        <span>
                                                                            {training.members.nodes
                                                                                .slice(
                                                                                    2,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        remainingMember: any,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                remainingMember.id
                                                                                            }
                                                                                            className="flex cursor-pointer hover:bg-sllightblue-200 items-center overflow-auto">
                                                                                            <div className="ps-3 py-2">
                                                                                                <div className="text-sm">
                                                                                                    {`${remainingMember.firstName ?? ''} ${remainingMember.surname ?? ''}`}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                        </span>
                                                                    </div>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )
                                                    }
                                                },
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-2 align-top lg:align-middle items-center text-left text-nowrap">
                                        {!isVesselView ? (
                                            <>
                                                {training.trainer?.id ===
                                                +memberId
                                                    ? 'You'
                                                    : `${(training.trainer && training.trainer.firstName) || ''} ${(training.trainer && training.trainer.surname) || ''}`}
                                            </>
                                        ) : (
                                            <>
                                                {training.trainer?.id ===
                                                +memberId
                                                    ? 'You'
                                                    : `${(training.trainer && training.trainer.firstName) || ''} ${(training.trainer && training.trainer.surname) || ''}`}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr
                            className={`group border-b dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                            <td colSpan={4} className="p-4">
                                <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                    <svg
                                        className="!w-[75px] h-auto"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 147 147.01">
                                        <path
                                            d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49Z"
                                            fill="#ffffff"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49ZM82.49,19.46c-2.01-1.1-4.14-1.85-6.39-2.26-1.42-.15-2.84-.35-4.25-.61-1.46-.26-2.79-.81-4.01-1.63l-.35-.35c-.29-.53-.6-1.04-.93-1.54-.09.7-.16,1.41-.21,2.12.03.4.08.8.16,1.19.13.44.27.88.44,1.31-.5-.61-.86-1.29-1.1-2.05-.08-.4-.17-.78-.28-1.17-1.72.92-2.73,2.36-3.03,4.29-.15,1.3-.07,2.59.26,3.85-.01,0-.03.01-.05.02-1.2-.58-2.25-1.38-3.15-2.38-.35-.41-.7-.83-1.03-1.26-3.65,4.71-4.58,9.92-2.8,15.63.22.67.48,1.32.77,1.96-.88.9-1.32,1.99-1.31,3.27.07,2.46.06,4.91-.05,7.37,0,.73.15,1.41.49,2.05.5.66,1.14.84,1.91.51.04,1.08.14,2.15.28,3.22.32,1.6.91,3.09,1.77,4.48,1.02,1.69,2.3,3.17,3.83,4.43.03,2.55-.21,5.07-.75,7.56-.25,1.08-.6,2.12-1.07,3.13-.06-.82-.08-1.65-.07-2.47-3.51,1.06-7.03,2.13-10.55,3.2-.05.18-.05.35,0,.54-3,1.03-5.75,2.5-8.26,4.41-2.49,1.95-4.29,4.41-5.39,7.4-1.44,3.7-2.48,7.51-3.13,11.43-.85,5.13-1.39,10.29-1.59,15.49-.28,6.88-.27,13.75.05,20.62-11.85-8.19-20.56-18.94-26.13-32.24C1.06,87.19-.22,73.03,2.77,58.47c3.41-15.3,10.86-28.21,22.37-38.71C37.53,8.77,52.05,2.64,68.68,1.38c16.31-.96,31.27,3.03,44.89,11.95,12.77,8.65,21.95,20.17,27.55,34.55,5.1,13.75,6.03,27.78,2.8,42.09-3.66,15.08-11.25,27.73-22.79,37.96-2.17,1.88-4.43,3.63-6.79,5.25.2-5.25.26-10.51.19-15.77-.08-6.3-.58-12.57-1.49-18.8-.61-4.17-1.64-8.23-3.08-12.18-.63-1.7-1.43-3.3-2.43-4.81-1.72-2.2-3.8-3.98-6.23-5.34-1.7-.97-3.47-1.78-5.32-2.43,0-.17,0-.34-.05-.51-3.51-1.07-7.03-2.14-10.55-3.2,0,.67,0,1.34-.02,2.01-.71-1.61-1.18-3.29-1.4-5.04-.28-1.92-.4-3.85-.37-5.79,3.51-3.05,5.38-6.9,5.6-11.57,1.09.43,1.85.11,2.29-.98.14-.36.23-.74.28-1.12.16-2.71.39-5.42.68-8.12.02-1.16-.35-2.16-1.12-3.01.72-2,.98-4.06.77-6.18-.23-3.02-.99-5.9-2.29-8.63-.25-.49-.6-.89-1.05-1.19-.9-.57-1.85-1.05-2.85-1.45-2.32-.93-4.66-1.69-7-2.29l2.94,2.1c.23.19.44.38.65.58ZM67.79,16.43c1.57.82,3.23,1.33,4.99,1.56,3.64.17,7,1.21,10.08,3.13.46.32.91.64,1.35.98.51.5,1.04.98,1.59,1.42-.16-.79-.37-1.58-.63-2.38-.2-.45-.44-.88-.72-1.28,1.17.37,2.29.87,3.36,1.49.51.3.88.73,1.1,1.28,1.49,3.35,2.14,6.85,1.96,10.5-.1,1.56-.58,3-1.45,4.29.18-3.13-.99-5.59-3.52-7.4-.08-.03-.15-.03-.23,0-4.07,1.24-8.23,2.1-12.46,2.57-2.13.23-4.26.21-6.39-.05-1.36-.17-2.6-.64-3.73-1.4-.21-.16-.4-.34-.58-.54-.19-.26-.38-.5-.58-.75-1.64.95-2.79,2.32-3.43,4.11-.3.85-.5,1.72-.61,2.61-1.41-2.86-1.97-5.88-1.68-9.05.29-2.38,1.11-4.56,2.45-6.53,1.01,1.13,2.2,2.04,3.55,2.73.78.31,1.59.5,2.43.58-.41-.98-.7-1.99-.86-3.03-.2-1.18-.11-2.33.28-3.45.21-.49.49-.92.84-1.31.7,1.83,1.95,3.13,3.76,3.9.83.28,1.67.51,2.52.7-.5-.54-1.01-1.07-1.52-1.61-.82-.9-1.43-1.93-1.84-3.08ZM59.06,37.38c.02-1.89.61-3.59,1.75-5.09.27-.27.54-.54.82-.79.95.91,2.07,1.54,3.36,1.89,1.62.42,3.27.61,4.95.58,2.57-.05,5.12-.3,7.65-.77,2.69-.48,5.34-1.11,7.96-1.89,1.99,1.57,2.86,3.62,2.64,6.16-1.77-1.75-3.9-2.51-6.39-2.26-.64.04-1.28.12-1.91.23-4.21.03-8.43.03-12.65,0-1.36-.26-2.73-.32-4.11-.19-1.57.32-2.92,1.02-4.06,2.12ZM70.63,36.68c1.94-.06,3.88-.06,5.83-.02-.65.41-1.14.96-1.47,1.66-.32-.55-.8-.86-1.42-.93-.27,0-.52.07-.75.21-.28.21-.51.45-.7.72-.34-.7-.84-1.24-1.49-1.63ZM90.65,37.75s.08,0,.12.05c.4.71.54,1.47.42,2.29-.28,2.48-.5,4.97-.65,7.47-.04.39-.17.75-.37,1.07-.05.06-.12.1-.19.14-.28-.12-.54-.28-.75-.51-.03-.92-.03-1.83,0-2.75.77-1.63.95-3.33.56-5.09-.1-.38-.23-.76-.4-1.12.48-.47.9-.98,1.26-1.54ZM57.06,37.8c.07.02.13.07.16.14.14.28.29.54.47.79.03.23.03.47,0,.7-.64,1.67-.7,3.37-.19,5.09,0,1.24.03,2.47.07,3.71-.01.07-.03.14-.05.21-.18.14-.38.25-.61.33-.16-.06-.26-.16-.3-.33-.14-.39-.21-.8-.21-1.21.1-2.4.12-4.81.05-7.21-.03-.81.18-1.54.61-2.22ZM73.48,38.59c.14,0,.26.07.35.19.37.52.63,1.1.79,1.73.35,2.87,1.61,5.26,3.76,7.16,2.84,2.21,5.77,2.32,8.77.33.28-.22.56-.47.82-.72.41,6.51-2.13,11.48-7.63,14.91-3.24,1.68-6.66,2.21-10.27,1.61-2.37-.47-4.43-1.5-6.21-3.1-1.87-1.68-3.29-3.69-4.27-6-.48-1.29-.73-2.63-.75-4.01-.08-1.29-.11-2.58-.09-3.87,1.68,1.94,3.8,2.78,6.37,2.54,1.8-.35,3.31-1.2,4.55-2.54,1.55-1.71,2.48-3.72,2.8-6.02.16-.82.49-1.55,1-2.19ZM64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26ZM82.3,62.29s.06.05.07.09c.02,2.8.39,5.56,1.12,8.26.37,1.28.92,2.46,1.66,3.55-.38,3.03-1.34,5.86-2.87,8.49-1.97,3.15-4.79,5.04-8.47,5.67-2.56-.19-4.8-1.12-6.72-2.8-1.84-1.76-3.19-3.85-4.04-6.28-.56-1.56-.95-3.17-1.17-4.81.49-.6.88-1.27,1.17-2.01.74-1.94,1.2-3.95,1.4-6.02.13-1.16.2-2.33.23-3.5.03-.04.07-.05.12-.02,1.95,1.3,4.09,2.05,6.44,2.24,3.31.29,6.45-.3,9.43-1.77.58-.32,1.12-.69,1.63-1.1ZM95.83,75.08c2.89,1.03,5.53,2.49,7.93,4.36,1.73,1.39,3.07,3.07,4.04,5.06,1.47,3.25,2.56,6.62,3.27,10.13.98,4.87,1.62,9.78,1.91,14.74.51,8.23.53,16.46.05,24.68-13.72,8.81-28.73,12.66-45.05,11.55-12.33-.99-23.66-4.84-33.99-11.55-.43-8.31-.4-16.62.09-24.92.3-4.98.95-9.91,1.96-14.79.66-3.2,1.64-6.29,2.94-9.29.87-2.03,2.14-3.76,3.8-5.2,2.48-2.08,5.27-3.66,8.35-4.74.6,6.75.21,13.43-1.14,20.06-.41,2.14-.95,4.24-1.63,6.3-.38,1.08-.89,2.1-1.54,3.03-.28.33-.6.6-.96.82-.16.08-.34.13-.51.16v16.8h56.27v-16.8c-.58-.15-1.05-.46-1.42-.93-.7-.99-1.25-2.06-1.63-3.22-.74-2.26-1.31-4.56-1.73-6.91-1-4.99-1.41-10.03-1.21-15.12.04-1.42.11-2.83.21-4.25Z"
                                            fill="#052350"
                                            fillRule="evenodd"
                                            opacity=".97"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M63.78,35.74c1.14,0,2.28.1,3.41.28v.61c1.76-.37,3.17.15,4.22,1.59.16.27.28.56.35.86-.17.49-.33.98-.47,1.47.18.08.36.13.56.14-.38,2.99-1.8,5.34-4.25,7.07-2.68,1.56-5.23,1.37-7.65-.56-1.64-1.53-2.37-3.42-2.17-5.67.14-1.59.81-2.92,1.98-3.99,1.16-1,2.5-1.6,4.01-1.8Z"
                                            fill="#2998e9"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M82.07,35.74c2.41-.13,4.41.71,6,2.52,1.27,1.71,1.65,3.61,1.12,5.69-.71,2.39-2.25,3.93-4.64,4.64-1.35.35-2.68.26-3.97-.28-1.83-.89-3.23-2.23-4.18-4.04-.65-1.19-1.03-2.47-1.14-3.83.19-.02.37-.06.56-.09-.11-.45-.25-.9-.42-1.33.23-.83.72-1.47,1.45-1.91.3-.18.61-.34.93-.47.71-.02,1.43-.03,2.15-.02v-.61c.72-.11,1.44-.2,2.15-.28Z"
                                            fill="#2998e9"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M65.55,40.6c.97,0,1.45.48,1.42,1.45-.23.75-.73,1.07-1.52.96-.66-.27-.95-.76-.86-1.47.16-.48.48-.79.96-.93Z"
                                            fill="#024450"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M81.18,40.6c.7-.04,1.18.28,1.42.93.06,1.08-.45,1.57-1.52,1.47-.81-.37-1.05-.97-.72-1.8.21-.3.48-.5.82-.61Z"
                                            fill="#052451"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M62.84,50.25h21.23c.1,3.78-1.35,6.8-4.34,9.08-3,2.03-6.23,2.51-9.71,1.45-3.65-1.35-5.96-3.91-6.93-7.68-.18-.94-.27-1.89-.26-2.85ZM64.1,51.47c.29,3.14,1.75,5.56,4.39,7.26,3.35,1.9,6.7,1.89,10.03-.05,2.59-1.7,4.03-4.11,4.34-7.21h-18.76Z"
                                            fill="#052250"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M73.2,89.54c.19.06.37.06.56,0,4.36-.67,7.63-2.91,9.82-6.72,1.49-2.78,2.43-5.73,2.8-8.87l.21-2.24c2.7.85,5.4,1.68,8.12,2.47-.29,3.81-.36,7.62-.21,11.43.33,4.44,1.02,8.83,2.05,13.16.46,1.91,1.12,3.75,2.01,5.51.3.54.67,1.03,1.1,1.47.22.21.48.39.75.54v14.79h-53.85v-14.79c.54-.3.98-.7,1.33-1.21.56-.85,1.03-1.75,1.4-2.71.97-2.75,1.68-5.57,2.15-8.45.95-5.12,1.31-10.28,1.07-15.49-.04-1.36-.13-2.73-.26-4.08.01-.06.03-.11.05-.16,2.69-.83,5.38-1.66,8.07-2.47.16,3.36.91,6.58,2.26,9.66,1.25,2.77,3.15,4.96,5.72,6.56,1.51.86,3.13,1.4,4.85,1.61Z"
                                            fill="#2998e9"
                                            strokeWidth="0px"
                                        />
                                        <path
                                            d="M45.34,125.8h23.84v6.63h-23.84v-6.63Z"
                                            fill="#052350"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M70.17,125.8h6.58v6.63h-6.58v-6.63Z"
                                            fill="#052250"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M77.77,125.8h23.84v6.63h-23.84v-6.63Z"
                                            fill="#052350"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M67.98,127.01v4.2h-21.42v-4.2h21.42Z"
                                            fill="#2a99ea"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M75.58,127.01v4.2h-4.2v-4.2h4.2Z"
                                            fill="#2a99ea"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M78.99,127.01h21.42v4.2h-21.42v-4.2Z"
                                            fill="#2a99ea"
                                            strokeWidth="0"
                                        />
                                        <path
                                            d="M64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26Z"
                                            fill="#ffffff"
                                            strokeWidth="0"
                                        />
                                    </svg>
                                    <p className="text-white text-xs font-light">
                                        WOW! Look at that! All your crew are
                                        ship-shaped and trained to the gills.
                                        Great job, captain!
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </TableWrapper>
            </div>
        </>
    )
}
