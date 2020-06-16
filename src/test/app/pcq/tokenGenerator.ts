import { expect } from 'chai'

import { BaseParameters } from '../../../main/app/pcq/models/pcqParameters'
import { TokenGenerator } from '../../../main/app/pcq/tokenGenerator'

describe('TokenGenerator', () => {
  describe('gen', () => {
    it('generate a token from PCQ base parameters', () => {

      const params: BaseParameters = {
        serviceId: 'CMC',
        actor: 'CLAIMANT',
        pcqId: 'abc123',
        partyId: 'test@test.com',
        returnUrl: 'test.com',
        language: 'en'
      }

      const expectedCiphertext = '53d01357273ef344318ef540bb4f23bc3949546bf92fc314907cc1d4e0f2693aa1beb20aa72ae91510' +
      'bdf5ebbe4ea5082f02e3ca11db84a7645507008d9d099b419a7ba61919964c60e0a3ca3997e6920f5294f2864a57cee77ce31773f0818' +
      'b35c9ed3545636ea09878adadd7873e653a559e6cec1eecdd7bec30e9c00199f3'

      expect(TokenGenerator.gen(params)).to.eq(expectedCiphertext)
    })
  })
})
