import { expect } from 'chai'
import * as request from 'supertest'

import 'test/routes/expectations'

import { app } from 'main/app'
import { Paths } from 'paths'

var step;
describe('Contact us page',() => {
  let server;

  beforeEach((done) => {
    server = app.listen(0, done)
  });

  afterEach( (done) => {
    server.close(done);
  });

  describe('on GET', () => {
    for (step = 0; step < 5000; step++) {
      it('should render cookies page when everything is fine', async() => {
        await request(server)
          .get(Paths.contactUsPage.uri)
          .expect(res => expect(res).to.be.successful.withText('Contact us'))
      })
    }
  })
})
