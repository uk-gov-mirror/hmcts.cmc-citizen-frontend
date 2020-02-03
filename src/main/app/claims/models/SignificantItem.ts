export class SignificantItem {
  type: string
  description: string
  url: string

  deserialize (input?: any): SignificantItem {
    if (input) {
      this.type = input.type
      this.description = input.description
      this.url = input.url
    }
    return this
  }
}
