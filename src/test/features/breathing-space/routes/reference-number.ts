
import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'

import { attachDefaultHooks } from 'test/routes/hooks'
import 'test/routes/expectations'
import { checkAuthorizationGuards } from 'test/features/claim/routes/checks/authorization-check'
import { checkEligibilityGuards } from 'test/features/claim/routes/checks/eligibility-check'

import { Paths as BreathingSpacePaths } from 'breathing-space/paths'

import { app } from 'main/app'

import * as idamServiceMock from 'test/http-mocks/idam'
import * as draftStoreServiceMock from 'test/http-mocks/draft-store'

const cookieName: string = config.get<string>('session.cookieName')
const headerText: string = 'Reference number must not be more than 16 characters'

describe('Breathing space: reference number page page', () => {
  attachDefaultHooks(app)

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', BreathingSpacePaths.referencNumberPage.uri)
    checkEligibilityGuards(app, 'get', BreathingSpacePaths.referencNumberPage.uri)

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', 'citizen')
      draftStoreServiceMock.resolveFind('claim')

      await request(app)
        .get(BreathingSpacePaths.referencNumberPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText(headerText))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', BreathingSpacePaths.referencNumberPage.uri)
    checkEligibilityGuards(app, 'post', BreathingSpacePaths.referencNumberPage.uri)

    describe('for authorized user', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor('1', 'citizen')
      })

      it('should render page when form is invalid and everything is fine', async () => {
        draftStoreServiceMock.resolveFind('claim')

        await request(app)
          .post(BreathingSpacePaths.referencNumberPage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ bsNumber: 'BS-12345678909876' })
          .expect(res => expect(res).to.be.successful.withText(headerText, 'div class="error-summary"'))
      })

      it('should redirect to Start date page when form is valid and nothing is submitted', async () => {
        draftStoreServiceMock.resolveFind('claim')
        draftStoreServiceMock.resolveUpdate()

        await request(app)
          .post(BreathingSpacePaths.referencNumberPage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ bsNumber: '' })
          .expect(res => expect(res).to.be.redirect.toLocation(BreathingSpacePaths.bsStartDatePage.uri))
      })

      it('should redirect to start date page when form is valid and number is provided', async () => {
        draftStoreServiceMock.resolveFind('claim')
        draftStoreServiceMock.resolveUpdate()

        await request(app)
          .post(BreathingSpacePaths.referencNumberPage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ bsNumber: '07000000000' })
          .expect(res => expect(res).to.be.redirect.toLocation(BreathingSpacePaths.bsStartDatePage.uri))
      })
    })
  })
})
