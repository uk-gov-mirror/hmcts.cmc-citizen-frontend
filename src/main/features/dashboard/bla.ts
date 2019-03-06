import { Logger } from '@hmcts/nodejs-logging'

const logger = Logger.getLogger('flowStateMachine')

const partAdmission = {
  description: 'Part Admission',
  dashboard: 'part_admission',
  condition: (claim) => claim.isPartialAdmission()
}
const fullAdmission = {
  description: 'Full Admission',
  condition: (claim) => claim.isFullAdmission(),
  dashboard: 'full_admission'
}
const payByInstalment = {
  description: 'Pay by Instalment',
  condition: (claim) => claim.isInstalments(),
  dashboard: 'pay_by_instalment'
}
const payBySetDate = {
  description: 'Pay by Set Date',
  condition: (claim) => claim.isPayBySetDate(),
  dashboard: 'pay_by_set_date'
}
const payImmediately = {
  description: 'Pay Immediately',
  condition: (claim) => claim.isPayImmediately(),
  dashboard: 'pay_immediately'
}

const settleOutOfCourt = {
  description: 'Settle out of court',
  condition: (claim) => false, // todo
  dashboard: 'reject_partial_amount_accept_mediation',
  next: [{
    description: 'Reject offer',
    condition: (claim) => false, // todo
    dashboard: 'reject_partial_amount_accept_mediation',
    next: []
  }, {
    description: 'Make legal agreement',
    condition: (claim) => false, // todo
    dashboard: 'reject_partial_amount_accept_mediation',
    next: [{
      description: 'Counter sign legal agreement',
      condition: (claim) => false, // todo
      dashboard: 'reject_partial_amount_accept_mediation',
      next: []
    }]
  }]
}
const rejectMediation = {
  description: 'Reject mediation or defendant does not consider mediation',
  condition: (claim) => false, // todo
  dashboard: 'reject_mediation'
}
const acceptMediation = {
  description: 'Accept Mediation',
  condition: (claim) => false, // todo
  dashboard: 'reject_partial_amount_accept_mediation'
}
const elegibleForCCJAfterDeadline = {
  description: 'elegibleForCCJ',
  condition: (claim) => claim.eligibleForCCJ,
  dashboard: 'ccj_requested_after_deadline'
}

const repaymentPlanFlow = [{
  description: 'Claimant rejected plan',
  condition: (claim) => claim.isSettlementAgreementRejected(),
  dashboard: 'rejected_plan',
  next: []
}, {
  description: 'Claimant approved plan',
  condition: (claim) => claim.hasClaimantAcceptedDefendantResponseWithSettlement(),
  dashboard: 'waiting_for_defendant_to_sign',
  next: [{
    description: 'Defendant has signed settlement agreement',
    condition: (claim) => claim.isSettlementReachedThroughAdmission(),
    dashboard: 'counter_signed',
    next: [{
      ...elegibleForCCJAfterDeadline,
      next: [{
        description: 'Refer to Judge',
        condition: (claim) => claim.hasRedeterminationBeenRequested,
        dashboard: 'referred_to_judge'
      }]
    }]
  }]
}]
export class Bla {
  static readonly flow = {
    description: 'Claim submitted',
    condition: () => true,
    dashboard: 'claim_submitted',
    next: [
      {
        ...partAdmission,
        next: [
          {
            ...payByInstalment,
            next: repaymentPlanFlow
          }, {
            ...payImmediately,
            next: [{
              ...rejectMediation,
              next: []
            }, {
              ...acceptMediation,
              next: []
            }]
          }, {
            ...payBySetDate,
            next: repaymentPlanFlow
          }]
      }, {
        ...fullAdmission,
        next: [{
          ...payByInstalment,
          next: repaymentPlanFlow
        }, {
          ...payImmediately,
          next: [
            {
              description: 'Payment past deadline',
              condition: (claim) => false, // todo
              dashboard: 'past_deadline',
              next: [
                {
                  ...elegibleForCCJAfterDeadline,
                  next: []
                }
              ]
            }
          ]
        }]
      }, {
        description: 'Full defence',
        condition: (claim) => false, // todo
        dashboard: 'full_defence',
        next: [{
          description: 'Dispute all of the claim',
          condition: (claim) => false, // todo
          dashboard: 'past_deadline',
          next: [{
            ...acceptMediation,
            next: [settleOutOfCourt]
          }, {
            ...rejectMediation,
            next: [settleOutOfCourt]
          }]
        }, {
          description: 'Dispute the claim and want to make a counter claim',
          condition: (claim) => false, // todo
          dashboard: 'past_deadline',
          next: []
        } ]
      }, {
        description: 'States paid',
        condition: (claim) => false, // todo
        dashboard: 'states_paid',
        next: [ {
          description: 'Admit part of the claim / Paid the claimant less than full amount',
          condition: (claim) => false, // todo
          dashboard: 'past_deadline',
          next: []
        }
        ]
      }
    ]
  }

  public showDashboardFor (claim): string {
    return this.decideFlow(Bla.flow, claim)
  }
  private navigateFlow (flow, i) {
    if (flow.next && flow.next.length !== 0) {
      ++i
      flow.next.forEach(next => {
        logger.debug(`${' '.repeat(i * 2)} ${i}: ${next.description}`)
        return this.navigateFlow(next, i)
      })
    }
  }

  public navigate () {
    logger.debug(`0: ${Bla.flow.description}`)
    return this.navigateFlow(Bla.flow, 0)
  }

  private decideFlow (flow, claim): string {
    const nextPossibleConditions = (flow.next || []).filter(elem => elem.condition(claim))
    const isLast = nextPossibleConditions.length === 0
    if (flow.condition(claim) && isLast) {
      return flow.dashboard
    }
    if (flow.condition(claim)) {
      return this.decideFlow(nextPossibleConditions[0], claim)
    }
  }
}
