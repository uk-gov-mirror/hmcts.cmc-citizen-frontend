import * as config from 'config'
import { v4 as uuidv4 } from 'uuid'
import { BaseParameters, InvokingParameters } from './models/pcqParameters'
import { TokenGenerator } from './tokenGenerator'

const serviceId = 'CMC'
const pcqUrl = config.get<string>('pcq.url')

export interface GetServiceEndpointParameters {
  actor: string
  ccdCaseId?: string
  partyId: string
  returnUrl: string
  language?: string
}

export class PcqClient {

  readonly pcqId: string

  constructor (pcqId?: string) {
    this.pcqId = pcqId || uuidv4()
  }

  getServiceEndpoint (params: GetServiceEndpointParameters) {

    const baseParameters: BaseParameters = {
      pcqId: this.pcqId,
      serviceId: serviceId,
      ...params
    }

    const invokingParameters: InvokingParameters = {
      ...baseParameters,
      token: TokenGenerator.gen(baseParameters)
    }

    const qs = Object.keys(invokingParameters)
      .map(key => key + '=' + invokingParameters[key])
      .join('&')

    return `${pcqUrl}/service-endpoint?${qs}`
  }

  isHealthy () {
    // TODO: Return boolean based on the PCQ health endpoint 'status' property

    return true
  }

}
