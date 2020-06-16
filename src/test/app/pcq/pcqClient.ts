import { expect } from 'chai'

import { GetServiceEndpointParameters, PcqClient } from '../../../main/app/pcq/pcqClient'

describe('PcqClient', () => {
  describe('getServiceEndpoint', () => {
    it('generate PCQ invoking URL', () => {

      const params: GetServiceEndpointParameters = {
        actor: 'CLAIMANT',
        partyId: 'test@test.com',
        returnUrl: 'test.com',
        language: 'en'
      }

      const pcqClient = new PcqClient('abc123')
      const expectedUrl = 'http://localhost:4000/service-endpoint?pcqId=abc123&serviceId=CMC&actor=CLAIMANT' +
        '&partyId=test@test.com&returnUrl=test.com&language=en&token='

      expect(pcqClient.getServiceEndpoint(params)).to.satisfy(url => url.startsWith(expectedUrl))
    })
  })

  // describe('isHealthy', () => {
  //   it('return true if PCQ is healthy', () => {
  //
  //   })
  //   it('return false if PCQ is unhealthy', () => {
  //
  //   })
  // })
})
