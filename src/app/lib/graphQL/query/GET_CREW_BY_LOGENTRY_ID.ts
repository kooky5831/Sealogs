import gql from 'graphql-tag'

/* export const GET_CREW_BY_LOGENTRY_ID = gql`
query GetCrewMembersLogEntrySectionByLogBookEntryID($getCrewMembersLogEntrySectionByLogBookEntryIdId: Int) {
  getCrewMembersLogEntrySectionByLogBookEntryID(id: $getCrewMembersLogEntrySectionByLogBookEntryIdId) {
    isSuccess
    data {
      ID
      CrewMemberID
      DutyPerformedID
      LogBookEntryID
      PunchIn
      PunchOut
    }
  }
}
`; */
export const GET_CREW_BY_LOGENTRY_ID = gql`
    query GetCrewMembersLogEntrySectionByLogBookEntryID($logBookEntryID: ID!) {
        readOneCrewMembers_LogBookEntrySection(
            filter: { logBookEntryID: { eq: $logBookEntryID } }
        ) {
            id
            crewMemberID
            dutyPerformedID
            logBookEntryID
            punchIn
            punchOut
        }
    }
`
