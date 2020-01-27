import { IsNotBlank } from '@hmcts/cmc-validators'
import { Claim } from 'claims/models/claim'

class ValidationErrors {
  static readonly CLAIM_ID_REQUIRED: string = 'Enter a claim ID'
}

export class ShowClaimDetailsByID {

  @IsNotBlank({ message: ValidationErrors.CLAIM_ID_REQUIRED })
  claimID?: string

  constructor (claimID?: string, claim?: Claim) {
    this.claimID = claimID
  }

  static fromObject (value?: any): ShowClaimDetailsByID {
    if (!value) {
      return value
    }
    return new ShowClaimDetailsByID(value.claimID)
  }

}
