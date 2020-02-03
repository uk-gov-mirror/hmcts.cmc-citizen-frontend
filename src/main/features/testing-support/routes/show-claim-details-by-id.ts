import * as express from 'express'
import { Paths } from 'testing-support/paths'
import { ErrorHandling } from 'shared/errorHandling'
import { Form } from 'forms/form'
import { ShowClaimDetailsByID } from 'testing-support/models/showClaimDetailsByID'
import { FormValidator } from 'forms/validation/formValidator'
import { Claim } from 'claims/models/claim'
import { ClaimStoreClient } from 'claims/claimStoreClient'
import { CaseEventDetail } from 'claims/models/CaseEventDetail'

function renderView (form: Form<ShowClaimDetailsByID>, res: express.Response): void {
  res.render(Paths.showClaimDetailsPage.associatedView, { form: form })
}

/* tslint:disable:no-default-export */
export default express.Router()
  .get(Paths.showClaimDetailsPage.uri,
    ErrorHandling.apply(async (req: express.Request, res: express.Response) => {
      renderView(new Form(new ShowClaimDetailsByID()), res)
    })
  )
  .post(Paths.showClaimDetailsPage.uri,
    FormValidator.requestHandler(ShowClaimDetailsByID, ShowClaimDetailsByID.fromObject),
    ErrorHandling.apply(async (req: express.Request, res: express.Response) => {
      const form: Form<ShowClaimDetailsByID> = req.body

      if (form.hasErrors()) {
        renderView(form, res)
      } else {
        try {
          const claim: Claim = await ClaimStoreClient.retrieveByClaimReference(form.model.claimID, res.locals.user.bearerToken)
          const caseEvents: CaseEventDetail[] = await ClaimStoreClient.retrieveCaseEvent(form.model.claimID, res.locals.user.bearerToken)
          res.render(Paths.showClaimDetailsPage.associatedView, {
            form: form,
            claimNumber: claim.claimNumber,
            id: claim.id,
            created_date: claim.createdAt,
            state: claim.state,
            caseEvents: caseEvents
          })
        } catch (err) {
          console.log("error :(")
        }
      }
    })
  )
