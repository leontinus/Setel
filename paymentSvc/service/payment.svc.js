const AWS = require('aws-sdk')
const {ddbTable} = require('./config')

class paymentSvc {
  constructor () {
    this.ddbClient = new AWS.DynamoDB.DocumentClient()
  }

  /**
   * Process payment
   */
  async process (userId, orderId) {
    console.info(`[payment.svc.process] Order ID: ${orderId}`)

    // mock data payment processing
    return {
      statusCode: 200,
      body: {
        message: `Payment successful`,
        details: {
          orderId: orderId,
          paymentTime: new Date().toISOString(),
          userId: userId,
          method: 'GrabPay',
          paymentId: this._paymentIdGenerator(),
          status: 'SUCCESS'
        }
      }
    }
  }

  /**
   * Create and store the payment record
   */
  async create (userId, paymentInfo) {
    console.info(`[payment.svc.create] Order ID: ${paymentInfo.orderId}`)

    try {
      const params = {
        TableName: ddbTable.paymentTable,
        Item : {
          PK: paymentInfo.orderId,
          SK: userId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          paymentTime: paymentInfo.paymentTime,
          method: paymentInfo.method,
          status: paymentInfo.status,
          paymentId: paymentInfo.paymentId,
          orderId: paymentInfo.orderId
        }
      }
      const result = await this.ddbClient.put(params).promise().then(
        (data) => {
          return {
            statusCode: 200,
            body: {
              message: `Payment for order ${JSON.stringify(paymentInfo.orderId)} stored`,
              input: paymentInfo,
            }
          }
        },
        (error) => {
          throw error
        }
      )
      return result
    } catch (error) {
      console.error(`[payment.svc.create] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }

  /**
   * Invoke function that wraps Lambda invoke
   */
  async invoke(payload = null, invocationType = 'RequestResponse', fnName) {
    console.info(`[payment.svc.invoke] Lambda name: ${fnName}`)

    const lambda = new AWS.Lambda()

    switch (invocationType) {
      case 'Event':
      case 'RequestResponse':
      case 'DryRun':
        break
      default: {
        console.error(`[lambda] Invalid invocationType: ${invocationType} used. Supported invocation types are Event|RequestResponse|DryRun`)
        return null
      }
    }

    let Payload = null
    if (payload) {
      Payload = JSON.stringify(payload)
    }

    const params = {
      FunctionName: fnName,
      InvocationType: invocationType,
      LogType: 'Tail',
      ...(Payload && {Payload})
    }

    console.log(`[lambda] params: ${JSON.stringify(params)}`)

    try {
      const response = await lambda.invoke(params).promise()
      if (response) {
        console.log(`[lambda] statusCode: ${response.StatusCode}`)
        if (response.Payload) {
          return JSON.parse(response.Payload)
        }
      }
    } catch (error) {
      console.error(`[lambda] error: ${JSON.stringify(error)}`)
      return null
    }

    return null
  }

  _paymentIdGenerator = () => {
    let dt = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (dt + Math.random()*16)%16 | 0
      dt = Math.floor(dt/16)
      return (c === 'x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
  }
}

module.exports = paymentSvc