const PaymentSvc = require('../service/payment.svc')
const paymentSvc = new PaymentSvc()
const {lambdaName} = require('../service/config')
const api = {}

/**
 * Process the payment 
 */
api.processPayment = async (event) => {
  console.info(`[payment.api.processPayment] Event: ${JSON.stringify(event)}`)

  try {
    const paymentProcess = await paymentSvc.process(event.userId, event.orderId)
    event.paymentDetails = paymentProcess.body.details
    await _storeRecord(event)
    await _callLambda(lambdaName.updateOrderStatus, event)
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Payment successful`
        },
        null,
        2
      ),
    }
  } catch (error) {
    console.error(`[payment.api.processPayment] Error: ${JSON.stringify(error)}`)
    return error
  }
}

/**
 * Store payment record 
 */
async function _storeRecord (event) {
  console.info(`[payment._storeRecord] Event: ${JSON.stringify(event)}`)

  try {
    console.log('userId: ' + event.userId)
    console.log('paymentDetails: ' + JSON.stringify(event.paymentDetails))
    const result = await paymentSvc.create(event.userId, event.paymentDetails)
    return result
  } catch (error) {
    console.error(`[payment._storeRecord] Error: ${JSON.stringify(error)}`)
    return error
  }
}

async function _callLambda (lambdaName, event) {
  console.info(`[payment._callLambda] Event: ${JSON.stringify(event)}`)

  try {
    const payload = {
      message: `Payment Successful`,
      response: event.paymentDetails,
      userId: event.userId,
      orderId: event.orderId
    }
    await paymentSvc.invoke(payload, 'Event', lambdaName)
  } catch (error) {
    console.error(`[payment._callLambda] Error: ${error}`)
    throw error
  }
}

module.exports = api

