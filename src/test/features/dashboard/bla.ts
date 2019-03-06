import { Bla } from 'dashboard/bla'
import { expect } from 'chai'
import { Claim } from 'claims/models/claim'
import * as claimStoreServiceMock from '../../http-mocks/claim-store'
import { PaymentOption } from 'claims/models/paymentOption'
import { PartialAdmissionResponse } from 'claims/models/response/partialAdmissionResponse'
import { FullAdmissionResponse } from 'claims/models/response/fullAdmissionResponse'
import { AcceptationClaimantResponse } from 'claims/models/claimant-response/acceptationClaimantResponse'
import { settlementAcceptationClaimantResponseData } from '../../data/entity/claimantResponseData'
import { PaymentSchedule } from 'claims/models/response/core/paymentSchedule'
import { MomentFactory } from 'shared/momentFactory'

describe.only('Bla', () => {

  describe('spikety spike', () => {
    it('should extract correct dashboard for part admission', () => {
      let claim = new Claim().deserialize({ ...claimStoreServiceMock.sampleClaimObj, ...claimStoreServiceMock.samplePartialAdmissionWithPaymentBySetDateResponseObj })
      const response = claim.response as PartialAdmissionResponse
      response.paymentIntention = {
        paymentOption: PaymentOption.INSTALMENTS,
        repaymentPlan: {
          instalmentAmount: 100,
          firstPaymentDate: MomentFactory.parse('2050-12-31'),
          paymentSchedule: PaymentSchedule.EACH_WEEK,
          completionDate: MomentFactory.parse('2051-12-31'),
          paymentLength: '1'
        }
      }
      claim.response = response
      claim.claimantResponse = AcceptationClaimantResponse.deserialize(settlementAcceptationClaimantResponseData)
      expect(new Bla().showDashboardFor(claim)).to.equal('waiting_for_defendant_to_sign')
    })

    it('should extract correct dashboard for full admission', () => {
      let claim = new Claim().deserialize({ ...claimStoreServiceMock.sampleClaimObj, ...claimStoreServiceMock.sampleFullAdmissionWithPaymentBySetDateResponseObj })
      const response = claim.response as FullAdmissionResponse
      response.paymentIntention.paymentOption = PaymentOption.IMMEDIATELY
      expect(new Bla().showDashboardFor(claim)).to.equal('pay_immediately')
    })

    it('should navigate all flows', () => {
      new Bla().navigate()
    })
  })
})
