import { Moment } from 'moment'
import { MomentFactory } from 'common/momentFactory'

export class InterestDate {

  constructor (public type?: string, public date?: Moment, public reason?: string, public endDate?: string) {}

  deserialize (input?: any): InterestDate {
    if (input) {
      this.type = input.type
      if (input.date !== undefined) {
        this.date = MomentFactory.parse(input.date)
      }
      if (input.reason) {
        this.reason = input.reason
      }
      if (input.endDate !== undefined) {
        this.endDate = input.endDate
      }
    }
    return this
  }

}
