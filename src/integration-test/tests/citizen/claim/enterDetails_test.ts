import I = CodeceptJS.I
import { ClaimSteps } from 'integration-test/tests/citizen/claim/steps/claim'
import { InterestSteps } from 'integration-test/tests/citizen/claim/steps/interest'
import { UserSteps } from 'integration-test/tests/citizen/home/steps/user'
import { PartyType } from 'integration-test/data/party-type'
import { PaymentSteps } from 'integration-test/tests/citizen/claim/steps/payment'
import { TestingSupportSteps } from 'integration-test/tests/citizen/testingSupport/steps/testingSupport'
import { HwfSteps } from 'integration-test/tests/citizen/claim/steps/help-with-fees'

const userSteps: UserSteps = new UserSteps()
const claimSteps: ClaimSteps = new ClaimSteps()
const interestSteps: InterestSteps = new InterestSteps()
const paymentSteps: PaymentSteps = new PaymentSteps()
const testingSupport: TestingSupportSteps = new TestingSupportSteps()
const hwfSteps: HwfSteps = new HwfSteps()

Feature('Claimant Enter details of claim')

Before(async (I: I) => {
  const claimantEmail = await I.getClaimantEmail()
  userSteps.login(claimantEmail)
  if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
    testingSupport.deleteClaimDraft()
  }
  claimSteps.completeEligibility()

})

Scenario('Claim with no interest @citizen', { retries: 0 }, async (I: I) => {
  await claimSteps.completeStartOfClaimJourney(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL, true)
  interestSteps.skipClaimInterest()
  const isHwfEnabled = await I.checkHWF()
  if (isHwfEnabled) {
    hwfSteps.noHWF()
  }
  I.see('Total amount you’re claiming')
  I.click('summary')
  I.see('Claim amount Claim fee Hearing fee')
  I.see('£0.01 to £300 £25 £25')
  I.see('£300.01 to £500 £35 £55')
  I.see('£500.01 to £1,000 £60 £80')
  I.see('£1,000.01 to £1,500 £70 £115')
  I.see('£1,500.01 to £3,000 £105 £170')
  I.see('£3,000.01 to £5,000 £185 £335')
  I.see('£5,000.01 to £10,000 £410 £335')
  interestSteps.skipClaimantInterestTotalPage()
  I.see('Prepare your claim')
  claimSteps.enterClaimDetails()

  await I.bypassPCQ()

  userSteps.selectCheckAndSubmitYourClaim()
  I.see('£80.50')
  I.see('I don’t want to claim interest')
  await claimSteps.checkClaimFactsAreTrueAndSubmit(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL, true)
  await paymentSteps.enterWorkingCard(I)
  paymentSteps.cancelPaymentFromConfirmationPage()
  I.waitForText('Your payment has been cancelled')
  paymentSteps.goBackToServiceFromConfirmationPage()

  await claimSteps.checkClaimFactsAreTrueAndSubmit(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL)
  await paymentSteps.payWithDeclinedCard(I)
  I.waitForText('Your payment has been declined')
  paymentSteps.goBackToServiceFromConfirmationPage()

  await claimSteps.checkClaimFactsAreTrueAndSubmit(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL)
  await paymentSteps.payWithWorkingCard(I)
  I.waitForText('Claim submitted')
})

Scenario('Claim with different interest rate and date @citizen', { retries: 3 }, async (I: I) => {
  await claimSteps.completeStartOfClaimJourney(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL, true)
  interestSteps.enterSpecificInterestRateAndDate(2, '1990-01-01')
  const isHwfEnabled = await I.checkHWF()
  if (isHwfEnabled) {
    hwfSteps.noHWF()
  }
  I.see('Total amount you’re claiming')
  interestSteps.skipClaimantInterestTotalPage()
  I.see('Prepare your claim')
  claimSteps.enterClaimDetails()
  await I.bypassPCQ().catch(e => { return false })
  userSteps.selectCheckAndSubmitYourClaim()
  I.see('£80.50')
  if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
    testingSupport.deleteClaimDraft()
  }
})

Scenario('Claim with a manually entered interest amount and a daily amount added @citizen', { retries: 3 }, async (I: I) => {
  await claimSteps.completeStartOfClaimJourney(I, PartyType.INDIVIDUAL, PartyType.INDIVIDUAL, true)
  interestSteps.enterBreakdownInterestAmountAndDailyAmount()
  const isHwfEnabled = await I.checkHWF()
  if (isHwfEnabled) {
    hwfSteps.noHWF()
  }
  I.see('Total amount you’re claiming')
  interestSteps.skipClaimantInterestTotalPage()
  I.see('Prepare your claim')
  claimSteps.enterClaimDetails()
  await I.bypassPCQ().catch(e => { return false })
  userSteps.selectCheckAndSubmitYourClaim()
  I.see('£80.50')
  I.see('Break down interest for different time periods or items')
  I.see('Show how you calculated the amount')
  if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
    testingSupport.deleteClaimDraft()
  }
})

// PCQ related tests
Scenario('I should not see PCQ if "Your deails" are missing while making a claim @citizen', { retries: 3 }, async (I: I) => {
  claimSteps.enterClaimDetails()

  // I shouldn't be navigated to PCQ instead I should be taken back to "Make a money claim" page
  I.see('Make a money claim')
  I.see('COMPLETE')
  if (process.env.FEATURE_TESTING_SUPPORT === 'true') {
    testingSupport.deleteClaimDraft()
  }
})

Scenario('I should be redirected to PCQ if "Your details" are filled in while making a claim @citizen', { retries: 3 }, async (I: I) => {
  // add your details
  userSteps.selectYourDetails()
  claimSteps.enterMyDetails(PartyType.INDIVIDUAL)

  // I should be taken back to 'Make a money claim'
  I.see('Make a money claim')
  I.see('COMPLETE')
  // add claim details
  claimSteps.enterClaimDetails()

  // check PCQ health before responding to the PCQ questionaire
  const pcqHealth = await I.checkPCQHealth()
  if (pcqHealth) {
  // I refuse to answer PCQ
    I.rejectAnsweringPCQ()
  }

  // Then i should be taken back to money claim
  I.see('Make a money claim')

})
