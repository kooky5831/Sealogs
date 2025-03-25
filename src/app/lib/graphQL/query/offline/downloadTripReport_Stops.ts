import gql from 'graphql-tag'

export const DownloadTripReport_Stops = gql`
    query DownloadTripReport_Stops($limit: Int = 100, $offset: Int = 0) {
        readTripReport_Stops(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                userDefinedData
                arriveTime
                departTime
                paxJoined
                paxDeparted
                vehiclesJoined
                vehiclesDeparted
                vehiclesJoinedNormal
                vehiclesJoinedVan
                vehiclesJoinedNormalTrailer
                vehiclesJoinedLorry
                vehiclesJoinedLorryTrailer
                vehiclesJoinedTractor
                vehiclesJoinedMotorbike
                vehiclesJoinedMotoRoller
                vehiclesJoinedBicycle
                vehiclesJoinedATV
                vehiclesJoinedOther
                vehiclesDepartedNormal
                vehiclesDepartedVan
                vehiclesDepartedNormalTrailer
                vehiclesDepartedLorry
                vehiclesDepartedLorryTrailer
                vehiclesDepartedTractor
                vehiclesDepartedMotorbike
                vehiclesDepartedMotoRoller
                vehiclesDepartedBicycle
                vehiclesDepartedATV
                vehiclesDepartedOther
                observedDepart
                observedArrive
                otherCargo
                lat
                long
                comments
                stopLocationID
                logBookEntrySectionID
                tripReportScheduleStopID
                dangerousGoodsChecklistID
            }
        }
    }
`
