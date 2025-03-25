
export type CrewTraining = {
    ID: number,
    Date: string,
    LogBookEntrySectionID: number,
    Members: number[],
    Signatures: { MemberID: number, SignatureData: string }[]
    TrainingLocationID: number,
    TrainingSummary: string,
    TrainingTypes: number[],
    TrainerID: number,
    VesselID: number
}
