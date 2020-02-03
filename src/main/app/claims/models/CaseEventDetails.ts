import List = Mocha.reporters.List

export class CaseEventDetails {

  caseEventDetailsList: List

  deserialize (input?: any): CaseEventDetails {
    if (input) {
      this.caseEventDetailsList = input.caseEventDetailsList
    }
    return this
  }
}
