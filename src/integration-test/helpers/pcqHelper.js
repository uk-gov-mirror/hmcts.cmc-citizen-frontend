'use strict'
/* globals codecept_helper */

// eslint-disable-next-line no-unused-vars
class PcqHelper extends codecept_helper {
  // this method assumes user is navigated to PCQ
  rejectAnsweringPCQ () {
    const helper = this.helpers['WebDriver'];
    helper.waitForText('Equality and diversity questions')
    return helper.click(`I don't want to answer these questions`);
  }
  // this silently bypasses PCQ without throwing any errors
  async bypassPCQ () {
    const helper = this.helpers['WebDriver'];
    const heading = await helper.grabTextFrom('h1');
    if (heading === 'Equality and diversity questions') {
      // reject answering PCQ
      return this.rejectAnsweringPCQ()
    } else {
      // silently move on.
      console.log('PCQ is disabled');
    }
  }
  async checkPCQHealth () {
    const helper = this.helpers['WebDriver'];
    const heading = await helper.grabTextFrom('h1');
    if (heading === 'Equality and diversity questions') {
      //if it is up and running
      console.log('Harshetha else: ' + heading);
      return true
    } else {
      // silently move on.
      console.log('Harshetha else: ' + heading);
      return false
    }
  }
}

module.exports = PcqHelper
