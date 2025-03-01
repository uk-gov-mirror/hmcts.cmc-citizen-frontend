/* Allow chai assertions which don't end in a function call, e.g. expect(thing).to.be.undefined */
/* tslint:disable:no-unused-expression */
/* tslint:disable:no-console */

import * as config from 'config'
import * as supertest from 'supertest'
import * as pa11y from 'pa11y'
import { expect } from 'chai'

import { RoutablePath } from 'shared/router/routablePath'
import { Paths as EligibilityPaths } from 'eligibility/paths'
import { ErrorPaths as ClaimIssueErrorPaths, Paths as ClaimIssuePaths } from 'claim/paths'
import { ErrorPaths as DefendantFirstContactErrorPaths, Paths as DefendantFirstContactPaths } from 'first-contact/paths'
import { FullAdmissionPaths, Paths, Paths as DefendantResponsePaths, StatementOfMeansPaths } from 'response/paths'
import { Paths as ClaimantResponsePaths } from 'claimant-response/paths'
import { Paths as CCJPaths } from 'ccj/paths'
import { Paths as OfferPaths } from 'offer/paths'
import { Paths as PaidInFullPaths } from 'paid-in-full/paths'
import { Paths as MediationPaths } from 'mediation/paths'
import { Paths as DirectionQuestionnairePaths } from 'directions-questionnaire/paths'
import { Paths as OrdersPaths } from 'orders/paths'
import { Paths as BreathingSpacePaths } from 'breathing-space/paths'
import { customAccessibilityChecks, checkInputLabels, checkTaskList, checkAnswers, checkError, CustomChecks, checkRole, checkButton, checkEligibilityLinks, checkTable, checkMultipleChoice, checkClaimAmountRows } from './customChecks'

import 'test/a11y/mocks'
import { app } from 'main/app'
import { MadeBy } from 'claims/models/madeBy'

app.locals.csrf = 'dummy-token'

const cookieName: string = config.get<string>('session.cookieName')

const agent = supertest(app)

interface Issue {
  type,
  code
}
interface RequestDetails {
  method: 'get' | 'post',
  send?: any
}
interface TestsOnSpecificPages {
  routes: Paths[],
  tests: CustomChecks,
  requestDetails?: RequestDetails
}

async function runPa11y (url: string): Promise<Issue[]> {
  const result = await pa11y(url, {
    includeWarnings: true,
    // Ignore GovUK template elements that are outside the team's control from a11y tests
    hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
    ignore: [
      'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs',  // Visual warning on invisible elements, so not relevant
      'WCAG2AA.Principle1.Guideline1_3.1_3_1_A.G141',  // DAC have rated Semantically Incorrect Headings as AAA, not AA
      'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2'   // CTSC Web_Chat fnding
    ],
    headers: {
      Cookie: `${cookieName}=ABC`
    },
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  })
  return result.issues
    .filter((issue: Issue) => issue.code !== 'WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1')
    .filter((issue: Issue) => issue.code !== 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent')
    .filter((issue: Issue) => issue.code !== 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H85.2')
}

function check (uri: string, customTests: CustomChecks = [], requestDetails: RequestDetails = { method: 'get' }): void {
  describe(`Page ${uri}`, () => {

    describe(`custom-accessibility tests for ${uri}`, () => {
      it('should not have errors in custom accessibility checks', async () => {
        const content = await extractPageContent(uri, requestDetails)
        customAccessibilityChecks(content, customTests)
      })
    })

    describe(`Pa11y tests for ${uri}`, () => {
      let issues: Issue[]
      before(async () => {
        issues = await runPa11y(agent.get(uri).url)
      })

      it('should have no accessibility errors', () => {
        ensureNoAccessibilityAlerts('error', issues)
      })

      it('should have no accessibility warnings', () => {
        ensureNoAccessibilityAlerts('warning', issues)
      })
    })
  })
}

// returns html as string from the respective url / route provided
async function extractPageContent (url: string, requestDetails: RequestDetails = { method: 'post' }): Promise<string> {
  let res: supertest.Response
  if (requestDetails.method === 'post') {
    res = await agent.post(url)
      .send(requestDetails.send ? requestDetails.send : null)
  } else {
    res = await agent.get(url)
    .set('Cookie', `${cookieName}=ABC;state=000MC000`)
  }

  if (res.redirect) {
    throw new Error(`Call to ${url} resulted in a redirect to ${res.get('Location')}`)
  }

  if (!res.ok) {
    throw new Error(`Call to ${url} resulted in ${res.status}`)
  }

  return res.text
}

function ensureNoAccessibilityAlerts (issueType: string, issues: Issue[]): void {
  const alerts: Issue[] = issues.filter((issue: Issue) => issue.type === issueType)
  expect(alerts, `\n${JSON.stringify(alerts, null, 2)}\n`).to.be.empty
}

const excludedPaths: Paths[] = [
  ClaimIssuePaths.finishPaymentController,
  ClaimIssuePaths.documentPage,
  ClaimIssuePaths.startPaymentReceiver,
  ClaimIssuePaths.finishPaymentReceiver,
  ClaimIssuePaths.initiatePaymentController,
  ClaimIssuePaths.receiptReceiver,
  ClaimIssuePaths.sealedClaimPdfReceiver,
  ClaimIssuePaths.draftReceiptReceiver,
  DefendantResponsePaths.receiptReceiver,
  DefendantResponsePaths.scannedResponseForm,
  DefendantResponsePaths.legacyDashboardRedirect,
  OfferPaths.agreementReceiver,
  DefendantFirstContactPaths.receiptReceiver,
  ClaimantResponsePaths.receiptReceiver,
  DirectionQuestionnairePaths.claimantHearingRequirementsReceiver,
  ClaimantResponsePaths.courtOfferedSetDatePage,
  DirectionQuestionnairePaths.hearingDatesDeleteReceiver,
  DirectionQuestionnairePaths.hearingDatesReplaceReceiver,
  DirectionQuestionnairePaths.hearingDatesPage,
  OrdersPaths.reviewOrderReceiver,
  OrdersPaths.directionsOrderDocument,
  MediationPaths.mediationAgreementDocument,
  DefendantResponsePaths.checkAndSendPage,
  BreathingSpacePaths.bsLiftPage,
  BreathingSpacePaths.referencNumberPage
]

// checks to be done for specific pages
// TODO these need to run on every page.
/*
 * As part of DAC report we were instructed to ensure test cases(most of the test cases are generalized) are in place for new fixes we added.
 * If then are any other existant defects then we are ignoring them for now
 * These ignored defects will be fixed/updated/generalized at some point when time permits with proper approval from the leads
 * Below 'checksIncluded' is used to map generic tests applied only for specific paths (to test DAC fixes)
 * The 'checksIncluded' should be removed once all other defects(that are not reported in DAC) are fixed.
*/

const testsOnSpecificPages: TestsOnSpecificPages[] = [
  {
    routes: [DefendantResponsePaths.defendantYourDetailsPage],
    tests: [checkInputLabels]
  },
  {
    routes: [
      DefendantResponsePaths.taskListPage,
      ClaimantResponsePaths.taskListPage,
      ClaimIssuePaths.taskListPage
    ], // testing checklist page
    tests: [checkTaskList]
  },
  {
    routes: [ClaimIssuePaths.checkAndSendPage, DefendantResponsePaths.checkAndSendPage],
    tests: [checkAnswers]
  },
  {
    routes: [EligibilityPaths.claimValuePage],
    tests: [checkError],
    requestDetails: {
      method: 'post'
    }
  },
  {
    routes: [StatementOfMeansPaths.monthlyIncomePage, StatementOfMeansPaths.monthlyExpensesPage],
    tests: [checkRole]
  },
  {
    routes: [ClaimIssuePaths.resolvingThisDisputerPage],
    tests: [checkButton]
  },
  {
    routes: [EligibilityPaths.notEligiblePage, EligibilityPaths.mcolEligibilityPage, DefendantFirstContactPaths.startPage],
    tests: [checkEligibilityLinks]
  },
  {
    routes: [ClaimIssuePaths.totalPage],
    tests: [checkTable]
  },
  {
    routes: [StatementOfMeansPaths.priorityDebtsPage],
    tests: [checkMultipleChoice]
  },
  {
    routes: [ClaimIssuePaths.amountPage],
    tests: [checkClaimAmountRows]
  }
]

describe('Accessibility', () => {
  function checkPaths (pathsRegistry: object): void {
    Object.values(pathsRegistry).forEach((path: RoutablePath) => {
      const excluded = excludedPaths.some(_ => _ === path)

      const specificChecks = testsOnSpecificPages.filter(checkList => {
        const pathAvailability = checkList.routes.filter(pathToAddChecks => {
          return path === pathToAddChecks
        })
        return pathAvailability.length > 0
      })
      let uri = path.uri
      if (!excluded) {
        if (path.uri.includes(':madeBy')) {
          uri = path.evaluateUri({ externalId: '91e1c70f-7d2c-4c1e-a88f-cbb02c0e64d6', madeBy: MadeBy.CLAIMANT.value })
        } else if (path.uri.includes(':externalId')) {
          uri = path.evaluateUri({ externalId: '91e1c70f-7d2c-4c1e-a88f-cbb02c0e64d6' })
        }
        check(uri, specificChecks.length ? specificChecks[0].tests : [], specificChecks.length ? specificChecks[0].requestDetails : undefined)
      }
    })
  }

  checkPaths(EligibilityPaths)
  checkPaths(BreathingSpacePaths)
  checkPaths(ClaimIssuePaths)
  checkPaths(ClaimIssueErrorPaths)
  checkPaths(DefendantFirstContactPaths)
  checkPaths(DefendantFirstContactErrorPaths)
  checkPaths(DefendantResponsePaths)
  checkPaths(CCJPaths)
  checkPaths(OfferPaths)
  checkPaths(StatementOfMeansPaths)
  checkPaths(FullAdmissionPaths)
  checkPaths(ClaimantResponsePaths)
  checkPaths(PaidInFullPaths)
  checkPaths(MediationPaths)
  checkPaths(DirectionQuestionnairePaths)
  checkPaths(OrdersPaths)
})
