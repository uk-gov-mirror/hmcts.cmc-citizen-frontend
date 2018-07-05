import * as express from 'express'

import { Paths } from 'eligibility/paths'
import { JwtExtractor } from 'idam/jwtExtractor'
import { ErrorHandling } from 'shared/errorHandling'

/* tslint:disable:no-default-export */
export default express.Router()
  .get(Paths.startPage.uri,
    ErrorHandling.apply(async (req: express.Request, res: express.Response): Promise<void> => {
      res.render(Paths.startPage.associatedView, {
        registeredUser: JwtExtractor.extract(req) !== undefined
      })
    }))
