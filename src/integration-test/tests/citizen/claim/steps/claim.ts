import { PartyType } from 'integration-test/data/party-type'
import {
  claimAmount,
  claimReason,
  createClaimant,
  createDefendant,
  postcodeLookupQuery,
  SMOKE_TEST_CITIZEN_USERNAME,
  SMOKE_TEST_USER_PASSWORD
} from 'integration-test/data/test-data'
import { CitizenCompletingClaimInfoPage } from 'integration-test/tests/citizen/claim/pages/citizen-completing-claim-info'
import { CitizenDobPage } from 'integration-test/tests/citizen/claim/pages/citizen-dob'
import { CitizenEmailPage } from 'integration-test/tests/citizen/claim/pages/citizen-email'
import { CitizenPhonePage } from 'integration-test/tests/citizen/claim/pages/citizen-phone'
import { CitizenResolveDisputePage } from 'integration-test/tests/citizen/claim/pages/citizen-resolve-dispute'
import { ClaimantCheckAndSendPage } from 'integration-test/tests/citizen/claim/pages/claimant-check-and-send'
import { ClaimantClaimAmountPage } from 'integration-test/tests/citizen/claim/pages/claimant-claim-amount'
import { ClaimantClaimConfirmedPage } from 'integration-test/tests/citizen/claim/pages/claimant-claim-confirmed'
import { ClaimantReasonPage } from 'integration-test/tests/citizen/claim/pages/claimant-reason'
import { CompanyDetailsPage } from 'integration-test/tests/citizen/claim/pages/company-details'
import { IndividualDetailsPage } from 'integration-test/tests/citizen/claim/pages/individual-details'
import { OrganisationDetailsPage } from 'integration-test/tests/citizen/claim/pages/organisation-details'
import { PartyTypePage } from 'integration-test/tests/citizen/claim/pages/party-type'
import { EligibilitySteps } from 'integration-test/tests/citizen/claim/steps/eligibility'
import { InterestSteps } from 'integration-test/tests/citizen/claim/steps/interest'
import { HwfSteps } from 'integration-test/tests/citizen/claim/steps/help-with-fees'
import { PaymentSteps } from 'integration-test/tests/citizen/claim/steps/payment'
import { UserSteps } from 'integration-test/tests/citizen/home/steps/user'
import { ClaimantTimelinePage } from 'integration-test/tests/citizen/claim/pages/claimant-timeline'
import { ClaimantEvidencePage } from 'integration-test/tests/citizen/claim/pages/claimant-evidence'
import { AmountHelper } from 'integration-test/helpers/amountHelper'
import { NewFeaturesPage } from 'integration-test/tests/citizen/claim/pages/new-features'
import { TestingSupportSteps } from 'integration-test/tests/citizen/testingSupport/steps/testingSupport'
import I = CodeceptJS.I

const I: I = actor()
const citizenResolveDisputePage: CitizenResolveDisputePage = new CitizenResolveDisputePage()
const citizenCompletingClaimInfoPage: CitizenCompletingClaimInfoPage = new CitizenCompletingClaimInfoPage()
const partyTypePage: PartyTypePage = new PartyTypePage()
const companyDetailsPage: CompanyDetailsPage = new CompanyDetailsPage()
const individualDetailsPage: IndividualDetailsPage = new IndividualDetailsPage()
const organisationDetailsPage: OrganisationDetailsPage = new OrganisationDetailsPage()
const citizenDOBPage: CitizenDobPage = new CitizenDobPage()
const citizenPhonePage: CitizenPhonePage = new CitizenPhonePage()
const citizenEmailPage: CitizenEmailPage = new CitizenEmailPage()
const claimantClaimAmountPage: ClaimantClaimAmountPage = new ClaimantClaimAmountPage()
const claimantReasonPage: ClaimantReasonPage = new ClaimantReasonPage()
const claimantTimelinePage: ClaimantTimelinePage = new ClaimantTimelinePage()
const claimantEvidencePage: ClaimantEvidencePage = new ClaimantEvidencePage()
const claimantCheckAndSendPage: ClaimantCheckAndSendPage = new ClaimantCheckAndSendPage()
const claimantClaimConfirmedPage: ClaimantClaimConfirmedPage = new ClaimantClaimConfirmedPage()
const newFeaturesPage: NewFeaturesPage = new NewFeaturesPage()
const testingSupport: TestingSupportSteps = new TestingSupportSteps()

const userSteps: UserSteps = new UserSteps()
const interestSteps: InterestSteps = new InterestSteps()
const eligibilitySteps: EligibilitySteps = new EligibilitySteps()
const paymentSteps: PaymentSteps = new PaymentSteps()
const hwfSteps: HwfSteps = new HwfSteps()

export class ClaimSteps {

  enterTestDataClaimAmount (): void {
    claimantClaimAmountPage.enterAmount(claimAmount.rows[0].amount, claimAmount.rows[1].amount, claimAmount.rows[2].amount)
  }

  resolveDispute (): void {
    citizenResolveDisputePage.confirmRead()
  }

  readCompletingYourClaim (): void {
    citizenCompletingClaimInfoPage.confirmRead()
  }

  enterMyDetails (claimantType: PartyType): void {
    const claimant = createClaimant(claimantType)
    switch (claimantType) {
      case PartyType.INDIVIDUAL:
        partyTypePage.selectIndividual()
        individualDetailsPage.enterName(claimant.name)
        individualDetailsPage.enterAddresses(claimant.address, claimant.correspondenceAddress)
        individualDetailsPage.submit()
        citizenDOBPage.enterDOB(claimant.dateOfBirth)
        break
      case PartyType.SOLE_TRADER:
        partyTypePage.selectSoleTrader()
        individualDetailsPage.enterName(claimant.name)
        individualDetailsPage.enterAddresses(claimant.address, claimant.correspondenceAddress)
        individualDetailsPage.submit()
        break
      case PartyType.COMPANY:
        partyTypePage.selectCompany()
        companyDetailsPage.enterCompanyName(claimant.name)
        companyDetailsPage.enterContactPerson(claimant.contactPerson)
        companyDetailsPage.enterAddresses(claimant.address, claimant.correspondenceAddress)
        companyDetailsPage.submit()
        break
      case PartyType.ORGANISATION:
        partyTypePage.selectOrganisationl()
        organisationDetailsPage.enterOrganisationName(claimant.name)
        organisationDetailsPage.enterContactPerson(claimant.contactPerson)
        organisationDetailsPage.enterAddresses(claimant.address, claimant.correspondenceAddress)
        organisationDetailsPage.submit()
        break
      default:
        throw new Error('non-matching claimant type for claim')
    }
    citizenPhonePage.enterPhone(claimant.phone)
  }

  async enterTheirDetails (I: I, defendantType: PartyType, enterDefendantEmail: boolean = true, byLookup: boolean = false): Promise<void> {
    const defendant = await createDefendant(I, defendantType, enterDefendantEmail)

    let manualEntryLink = true
    switch (defendantType) {
      case PartyType.INDIVIDUAL:
        partyTypePage.selectIndividual()
        individualDetailsPage.enterTitle(defendant.title)
        individualDetailsPage.enterFirstName(defendant.firstName)
        individualDetailsPage.enterLastName(defendant.lastName)
        if (byLookup) {
          individualDetailsPage.lookupAddress(postcodeLookupQuery)
          manualEntryLink = false
        }
        individualDetailsPage.enterAddress(defendant.address, manualEntryLink)
        individualDetailsPage.submit()
        break
      case PartyType.SOLE_TRADER:
        partyTypePage.selectSoleTrader()
        individualDetailsPage.enterFirstName(defendant.firstName)
        individualDetailsPage.enterLastName(defendant.lastName)
        if (byLookup) {
          individualDetailsPage.lookupAddress(postcodeLookupQuery)
          manualEntryLink = false
        }
        individualDetailsPage.enterAddress(defendant.address, manualEntryLink)
        individualDetailsPage.submit()
        break
      case PartyType.COMPANY:
        partyTypePage.selectCompany()
        companyDetailsPage.enterCompanyName(defendant.name)
        if (byLookup) {
          individualDetailsPage.lookupAddress(postcodeLookupQuery)
          manualEntryLink = false
        }
        companyDetailsPage.enterAddress(defendant.address, manualEntryLink)
        companyDetailsPage.submit()
        break
      case PartyType.ORGANISATION:
        partyTypePage.selectOrganisationl()
        organisationDetailsPage.enterOrganisationName(defendant.name)
        if (byLookup) {
          individualDetailsPage.lookupAddress(postcodeLookupQuery)
          manualEntryLink = false
        }
        organisationDetailsPage.enterAddress(defendant.address, manualEntryLink)
        organisationDetailsPage.submit()
        break
      default:
        throw new Error('non-matching defendant Type type for claim')
    }
    if (enterDefendantEmail) {
      citizenEmailPage.enterEmail(defendant.email)
    } else {
      citizenEmailPage.submitForm()
    }

    citizenPhonePage.enterPhone(defendant.phone)
  }

  enterClaimAmount (amount1: number, amount2: number, amount3): void {
    claimantClaimAmountPage.enterAmount(amount1, amount2, amount3)
  }

  claimantTotalAmountPageRead (): void {
    claimantClaimAmountPage.continue()
  }

  enterClaimReason (): void {
    claimantReasonPage.enterReason(claimReason)
  }

  enterClaimTimeline (): void {
    claimantTimelinePage.enterTimelineRow('may', 'ok')
  }

  enterClaimEvidence (): void {
    claimantEvidencePage.enterEvidenceRow('CONTRACTS_AND_AGREEMENTS', 'ok')
  }

  async checkClaimFactsAreTrueAndSubmit (I: I, claimantType: PartyType, defendantType: PartyType, enterDefendantEmail: boolean = true): Promise<void> {
    await claimantCheckAndSendPage.verifyCheckAndSendAnswers(I, claimantType, defendantType, enterDefendantEmail)

    if (claimantType === PartyType.COMPANY || claimantType === PartyType.ORGANISATION) {
      claimantCheckAndSendPage.signStatementOfTruthAndSubmit('Jonny', 'Director')
    } else {
      claimantCheckAndSendPage.checkFactsTrueAndSubmit()
    }
  }

  async makeAClaimAndSubmitStatementOfTruth (I: I, email: string, claimantType: PartyType, defendantType: PartyType, enterDefendantEmail: boolean = true) {
    userSteps.login(email)
    if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
      testingSupport.deleteClaimDraft()
    }
    this.completeEligibility()
    userSteps.selectResolvingThisDispute()
    this.resolveDispute()
    userSteps.selectCompletingYourClaim()
    this.readCompletingYourClaim()
    userSteps.selectYourDetails()
    this.enterMyDetails(claimantType)
    userSteps.selectTheirDetails()
    await this.enterTheirDetails(I, defendantType, enterDefendantEmail)
    userSteps.selectClaimAmount()
    this.enterTestDataClaimAmount()
    this.claimantTotalAmountPageRead()
    interestSteps.enterDefaultInterest()
    const isHwfEnabled = await I.checkHWF()
    if (isHwfEnabled) {
      hwfSteps.noHWF()
    }
    I.see('Total amount you’re claiming')
    I.see(AmountHelper.formatMoney(claimAmount.getClaimTotal()), 'table.table-form > tbody > tr:nth-of-type(1) >td.numeric.last > span')
    I.see(AmountHelper.formatMoney(claimAmount.getTotal()), 'table.table-form > tfoot > tr > td.numeric.last > span')
    interestSteps.skipClaimantInterestTotalPage()
    this.enterClaimDetails()
    I.bypassPCQ()
    userSteps.selectCheckAndSubmitYourClaim()
    await this.checkClaimFactsAreTrueAndSubmit(I, claimantType, defendantType, enterDefendantEmail)
  }

  async makeAClaimAndSubmit (I: I, email: string, claimantType: PartyType, defendantType: PartyType, enterDefendantEmail: boolean = true): Promise<string> {
    await this.makeAClaimAndSubmitStatementOfTruth(I, email, claimantType, defendantType, enterDefendantEmail)
    await paymentSteps.payWithWorkingCard(I)
    I.waitForText('Claim submitted')
    return claimantClaimConfirmedPage.getClaimReference()
  }

  completeEligibility (): void {
    eligibilitySteps.complete()
  }

  optIntoNewFeatures (): void {
    newFeaturesPage.optIn()
  }

  async makeAClaimAndNavigateUpToPayment (I: I) {
    const claimant = createClaimant(PartyType.INDIVIDUAL)
    const defendant = await createDefendant(I, PartyType.INDIVIDUAL, true)

    userSteps.loginWithPreRegisteredUser(SMOKE_TEST_CITIZEN_USERNAME, SMOKE_TEST_USER_PASSWORD)
    if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
      testingSupport.deleteClaimDraft()
    }
    this.completeEligibility()

    userSteps.selectResolvingThisDispute()
    this.resolveDispute()
    userSteps.selectCompletingYourClaim()
    this.readCompletingYourClaim()
    userSteps.selectYourDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterName(claimant.name)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(claimant.address, false)
    individualDetailsPage.submit()
    citizenDOBPage.enterDOB(claimant.dateOfBirth)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectTheirDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterTitle(defendant.title)
    individualDetailsPage.enterFirstName(defendant.firstName)
    individualDetailsPage.enterLastName(defendant.lastName)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(defendant.address, false)
    individualDetailsPage.submit()
    citizenEmailPage.enterEmail(defendant.email)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectClaimAmount()
    I.see('Claim amount')
    this.enterClaimAmount(10, 20.50, 50)
    I.see('£80.50')
    this.claimantTotalAmountPageRead()
    I.see('Do you want to claim interest?')
    interestSteps.enterDefaultInterest()
    const isHwfEnabled = await I.checkHWF()
    if (isHwfEnabled) {
      hwfSteps.noHWF()
    }
    I.see('Total amount you’re claiming')
    I.see('£25')
    I.see(AmountHelper.formatMoney(claimAmount.getClaimTotal()), 'table.table-form > tbody > tr:nth-of-type(1) >td.numeric.last > span')
    I.see(AmountHelper.formatMoney(claimAmount.getTotal()), 'table.table-form > tfoot > tr > td.numeric.last > span')
    interestSteps.skipClaimantInterestTotalPage()
    this.enterClaimDetails()
    I.bypassPCQ()
    userSteps.selectCheckAndSubmitYourClaim()
    I.see('John Smith')
    I.see('10, DALBERG')
    I.see('LONDON')
    I.see('SW2 1AN')
    I.see('07700000001')
    I.see(claimReason)
    await claimantCheckAndSendPage.verifyDefendantCheckAndSendAnswers(I, PartyType.INDIVIDUAL, true)
    claimantCheckAndSendPage.verifyClaimAmount()

    if (!process.env.CITIZEN_APP_URL.includes('sprod')) {
      claimantCheckAndSendPage.checkFactsTrueAndSubmit()
      I.waitForText('Enter card details')
    }
  }

  async completeStartOfClaimJourney (I: I, claimantType: PartyType, defendantType: PartyType, enterDefendantEmail: boolean = true) {
    userSteps.selectResolvingThisDispute()
    this.resolveDispute()
    userSteps.selectCompletingYourClaim()
    this.readCompletingYourClaim()
    userSteps.selectYourDetails()
    this.enterMyDetails(claimantType)
    userSteps.selectTheirDetails()
    await this.enterTheirDetails(I, defendantType, enterDefendantEmail, true)
    userSteps.selectClaimAmount()
    I.see('Claim amount')
    this.enterClaimAmount(10, 20.50, 50)
    I.see('£80.50')
    this.claimantTotalAmountPageRead()
    I.see('Do you want to claim interest?')
  }

  enterClaimDetails () {
    userSteps.selectClaimDetails()
    this.enterClaimReason()
    this.enterClaimTimeline()
    this.enterClaimEvidence()
  }

  async makeAHwfClaimAndNavigateUpToPayment (I: I) {
    const claimant = createClaimant(PartyType.INDIVIDUAL)
    const defendant = await createDefendant(I, PartyType.INDIVIDUAL, true)
    claimantCheckAndSendPage.open('')
    // userSteps.loginWithPreRegisteredUser(SMOKE_TEST_CITIZEN_USERNAME, SMOKE_TEST_USER_PASSWORD)
    if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
      testingSupport.deleteClaimDraft()
    }
    this.completeEligibility()
    userSteps.selectResolvingThisDispute()
    this.resolveDispute()
    userSteps.selectCompletingYourClaim()
    this.readCompletingYourClaim()
    userSteps.selectYourDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterName(claimant.name)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(claimant.address, false)
    individualDetailsPage.submit()
    citizenDOBPage.enterDOB(claimant.dateOfBirth)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectTheirDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterTitle(defendant.title)
    individualDetailsPage.enterFirstName(defendant.firstName)
    individualDetailsPage.enterLastName(defendant.lastName)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(defendant.address, false)
    individualDetailsPage.submit()
    citizenEmailPage.enterEmail(defendant.email)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectClaimAmount()
    I.see('Claim amount')
    this.enterClaimAmount(10, 20.50, 50)
    I.see('£80.50')
    this.claimantTotalAmountPageRead()
    I.see('Do you want to claim interest?')
    interestSteps.enterDefaultInterest()
    const isHwfEnabled = await I.checkHWF()
    if (isHwfEnabled) {
      hwfSteps.complete()
    }
    I.see('Total amount you’re claiming')
    I.see('£25')
    I.see(AmountHelper.formatMoney(claimAmount.getClaimTotal()), 'table.table-form > tbody > tr:nth-of-type(1) >td.numeric.last > span')
    I.see(AmountHelper.formatMoney(claimAmount.getTotal()), 'table.table-form > tfoot > tr > td.numeric.last > span')
    interestSteps.skipClaimantInterestTotalPage()
    this.enterClaimDetails()
    I.bypassPCQ()
    userSteps.selectCheckAndSubmitYourClaim()
    I.see('John Smith')
    I.see('10, DALBERG')
    I.see('LONDON')
    I.see('SW2 1AN')
    I.see('07700000001')
    I.see(claimReason)
    await claimantCheckAndSendPage.verifyDefendantCheckAndSendAnswers(I, PartyType.INDIVIDUAL, true)
    claimantCheckAndSendPage.verifyClaimAmount()
  }
  async makeAHwfClaimAndSubmit (I: I) {
    const claimant = createClaimant(PartyType.INDIVIDUAL)
    const defendant = await createDefendant(I, PartyType.INDIVIDUAL, true)
    claimantCheckAndSendPage.open('')
    const claimantEmail = await I.getClaimantEmail()
    userSteps.login(claimantEmail)
    if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
      testingSupport.deleteClaimDraft()
    }
    this.completeEligibility()
    userSteps.selectResolvingThisDispute()
    this.resolveDispute()
    userSteps.selectCompletingYourClaim()
    this.readCompletingYourClaim()
    userSteps.selectYourDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterName(claimant.name)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(claimant.address, false)
    individualDetailsPage.submit()
    citizenDOBPage.enterDOB(claimant.dateOfBirth)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectTheirDetails()
    partyTypePage.selectIndividual()
    individualDetailsPage.enterTitle(defendant.title)
    individualDetailsPage.enterFirstName(defendant.firstName)
    individualDetailsPage.enterLastName(defendant.lastName)
    individualDetailsPage.lookupAddress(postcodeLookupQuery)
    individualDetailsPage.enterAddress(defendant.address, false)
    individualDetailsPage.submit()
    citizenEmailPage.enterEmail(defendant.email)
    citizenPhonePage.enterPhone(claimant.phone)
    userSteps.selectClaimAmount()
    I.see('Claim amount')
    this.enterClaimAmount(10, 20.50, 50)
    I.see('£80.50')
    this.claimantTotalAmountPageRead()
    I.see('Do you want to claim interest?')
    interestSteps.enterDefaultInterest()
    const isHwfEnabled = await I.checkHWF()
    if (isHwfEnabled) {
      hwfSteps.complete()
    }
    I.see('Total amount you’re claiming')
    I.see('£25')
    I.see(AmountHelper.formatMoney(claimAmount.getClaimTotal()), 'table.table-form > tbody > tr:nth-of-type(1) >td.numeric.last > span')
    I.see(AmountHelper.formatMoney(claimAmount.getTotal()), 'table.table-form > tfoot > tr > td.numeric.last > span')
    interestSteps.skipClaimantInterestTotalPage()
    this.enterClaimDetails()
    I.bypassPCQ()
    userSteps.selectCheckAndSubmitYourClaim()
    I.see('John Smith')
    I.see('10, DALBERG')
    I.see('LONDON')
    I.see('SW2 1AN')
    I.see('07700000001')
    I.see(claimReason)
    await claimantCheckAndSendPage.verifyDefendantCheckAndSendAnswers(I, PartyType.INDIVIDUAL, true)
    claimantCheckAndSendPage.verifyClaimAmount()
    if (isHwfEnabled) {
      I.see('HWF1234567')
    }
    if (!process.env.CITIZEN_APP_URL.includes('sprod')) {
      claimantCheckAndSendPage.checkFactsTrueAndSubmit()

      // Commented below due to CCD events are in readyonly in AAT. This code needs to be enabled post formal release of the Help with Fees
/*       I.waitForText('Claim submitted')
      claimantClaimConfirmedPage.getClaimReference() */
    }
  }
}
