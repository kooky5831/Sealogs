import gql from 'graphql-tag'

export const Get_EventType_TaskingChecklist = gql`
    query Get_EventType_TaskingChecklist(
        $filter: EventType_TaskingFilterFields = {}
    ) {
        readEventType_Taskings(filter: $filter, sort: { created: DESC }) {
            nodes {
                id
                title
                time
                type
                status
                cgop
                sarop
                created
                geoLocation {
                    id
                    title
                    lat
                    long
                }
                tripEvent {
                    logBookEntrySection {
                        logBookEntryID
                        logBookEntry {
                            vehicle {
                                id
                                title
                            }
                        }
                    }
                }
                towingChecklist {
                    id
                    conductSAP
                    investigateNatureOfIssue
                    everyoneOnBoardOk
                    rudderToMidshipsAndTrimmed
                    lifejacketsOn
                    communicationsEstablished
                    secureAndSafeTowing
                    member {
                        id
                        firstName
                        surname
                    }
                    riskFactors {
                        nodes {
                            id
                            type
                            title
                            impact
                            probability
                            created
                            mitigationStrategy {
                                nodes {
                                    id
                                    strategy
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`
