export type ActivityStreamType = {
  ID: number
  Title: string
  Type: string
  TargetClass: string
  TargetID: number
  ContextClass: string
  ContextID: number
  URL: string
  RefererURL: string
  IPAddress: string
  Created: string
  Member: Member
  APIRequestID: number
}

export type Member = {
  ID: number
  FirstName: string
  Surname: string
}