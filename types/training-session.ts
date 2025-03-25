export type TrainingSessionType = {
    ID: number
    Date: string
    LogBookEntrySectionID: number
    Members: {
        ID: number
        FirstName: string
        Surname: string
    }[]
    Signatures: {
        MemberID: number
        SignatureData: string
    }[]
    TrainerID: number
    Trainer: {
        ID: number
        FirstName: string
        Surname: string
    }
    TrainingLocationID: number
    TrainingLocation: {
        ID: number
        Title: string
        IsVessel: boolean
    }
    TrainingSummary: string
    TrainingTypes: {
        ID: number
        Title: string
    }[]
    VesselID: number
    Vessel: {
        ID: number
        Title: string
    }
}
