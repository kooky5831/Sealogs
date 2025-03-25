export type TrainingTypeType = {
    ID: number,
    Archived: boolean,
    HighWarnWithin: number,
    MediumWarnWithin: number,
    OccursEvery: number,
    Procedure: string,
    Title: string,
    TrainingSessions: number[],
    Vessels: {
        ID: number,
        Title: string
    }[]
}
