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
    let pcqDisabled = false;
    const heading = await helper.grabTextFrom('h1')
    .catch(() => {
      pcqDisabled = true;
    })

    if (pcqDisabled) {
      return false;
    }
    
    switch(heading) {
      case 'Equality and diversity questions':
        this.rejectAnsweringPCQ()
        return true
        break;
      case 'Make a money claim':
        console.log('PCQ is disabled');
        return false
        break;
      case 'Sorry, there is a problem with the service':
        console.log('Error in PCQ Service, hence continuing to CMC jourey');
        return false
        break;
      default:
        console.log('PCQ is disabled due to an unknown reason')
        return false
    }
  }
  async checkPCQHealth () {
    const helper = this.helpers['WebDriver'];
    let pcqDisabled = false;
    const heading = await helper.grabTextFrom('h1')
    .catch(() => {
      pcqDisabled = true;
    })

    if (pcqDisabled) {
      return false;
    }
    
    switch(heading) {
      case 'Equality and diversity questions':
        return true
        break;
      case 'Make a money claim':
        console.log('PCQ is disabled.');
        return false
        break;
      case 'Sorry, there is a problem with the service':
        console.log('Error in PCQ Service, hence continuing to CMC jourey');
        return false
        break;
      default:
        console.log('PCQ is disabled due to an unknown reason')
        return false
    }
  }
}

module.exports = PcqHelper
