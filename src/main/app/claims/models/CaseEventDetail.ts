import { LocalDate } from 'forms/models/localDate'
import { SignificantItem } from 'claims/models/SignificantItem'
export class CaseEventDetail {

  userId: string
  userLastName: string
  userFirstName: string
  createdDate: LocalDate
  caseTypeId: string
  caseTypeVersion: number
  description: string
  eventName: string
  id: string
  stateId: string
  stateName: string
  data: Map<String, Object>
  dataClassification: Map<String, Object>
  significantItem: SignificantItem

  deserialize (input?: any): CaseEventDetail {
    if (input) {
      this.userId = input.userId
      this.userLastName = input.userLastname
      this.userFirstName = input.userFirstName
      this.createdDate = input.createdDate
      this.caseTypeId = input.caseTypeId
      this.caseTypeVersion = input.caseTypeVersion
      this.description = input.description
      this.eventName = input.eventName
      this.id = input.id
      this.stateId = input.stateId
      this.stateName = input.stateName
      this.data = input.data
      this.dataClassification = input.dataClassification
      this.significantItem = input.significantItem
    }
    return this
  }
}
