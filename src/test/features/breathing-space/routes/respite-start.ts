import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'

import { attachDefaultHooks } from 'test/routes/hooks'
import 'test/routes/expectations'
import { checkAuthorizationGuards } from 'test/features/claim/routes/checks/authorization-check'
import { Paths as BreathingSpacePaths } from 'breathing-space/paths'

import { app } from 'main/app'

import * as idamServiceMock from 'test/http-mocks/idam'
import * as draftStoreServiceMock from 'test/http-mocks/draft-store'
import { Moment } from 'moment'
import { MomentFactory } from 'shared/momentFactory'

const cookieName: string = config.get<string>('session.cookieName')

describe('Enter breathing space: Respite start date page', () => {
  attachDefaultHooks(app)

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', BreathingSpacePaths.bsStartDatePage.uri)

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', 'citizen')
      draftStoreServiceMock.resolveFind('claim')

      await request(app)
        .get(BreathingSpacePaths.bsStartDatePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('When did it start?'))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', BreathingSpacePaths.bsStartDatePage.uri)

    describe('for authorized user', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor('1', 'citizen')
      })

      it('should render page with error when date is less than or equal to today', async () => {
        draftStoreServiceMock.resolveFind('claim')
        const date: Moment = MomentFactory.currentDate().subtract(1, 'year')
        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: date.date(), month: date.month() + 1, year: date.year() } })
          .expect(res => expect(res).to.be.successful.withText('The start date must not be after today', 'There was a problem'))
      })

      it('should redirect to type page when form is valid and everything is fine', async () => {
        draftStoreServiceMock.resolveFind('claim')
        const date: Moment = MomentFactory.currentDate().subtract(1, 'year')

        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: '31', month: '12', year: date.year() - 1 } })
          .expect(res => expect(res).to.be.redirect.toLocation(BreathingSpacePaths.bsTypePage.uri))
      })

      it('should redirect to type page when form is valid (without date) and everything is fine', async () => {
        draftStoreServiceMock.resolveFind('claim')

        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: '', month: '', year: '' } })
          .expect(res => expect(res).to.be.redirect.toLocation(BreathingSpacePaths.bsTypePage.uri))
      })

      it('should render page with error when invalid day is provided', async () => {
        draftStoreServiceMock.resolveFind('claim')

        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: '33', month: '', year: '2021' } })
          .expect(res => expect(res).to.be.successful.withText('Please enter a valid date', 'There was a problem'))
      })

      it('should render page with error when invalid month is provided', async () => {
        draftStoreServiceMock.resolveFind('claim')

        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: '3', month: '18', year: '2021' } })
          .expect(res => expect(res).to.be.successful.withText('Please enter a valid date', 'There was a problem'))
      })

      it('should render page with error when invalid day is provided', async () => {
        draftStoreServiceMock.resolveFind('claim')

        await request(app)
          .post(BreathingSpacePaths.bsStartDatePage.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .send({ respiteEnd: { day: '3', month: '3', year: '12345' } })
          .expect(res => expect(res).to.be.successful.withText('Please enter a valid date', 'There was a problem'))
      })
    })
  })
})
