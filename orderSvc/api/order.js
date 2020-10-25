const OrderSvc = require('../service/order.svc')
const orderSvc = new OrderSvc()
const api = {}

/**
 * API to create order
 */
api.createOrder = async (event) => {
  console.log(`[order.api.createOrder] Event: ${JSON.stringify(event)}`)

  try {
    const result = await orderSvc.create(event.userId, event.orderInfo)
    return result
  } catch (error) {
    console.error(`[order.api.createOrder] Error: ${JSON.stringify(error)}`)
    return error
  }
}

/**
 * API to cancel order
 */
api.cancelOrder = async (event) => {
  console.info(`[order.api.cancelOrder] Event: ${JSON.stringify(event)}`)

  try {
    const result = await orderSvc.cancel(event.userId, event.orderId)
    return result
  } catch (error) {
    console.error(`[order.api.cancelOrder] Error: ${JSON.stringify(error)}`)
    return error
  }
}

/**
 * API to check order
 */
api.checkOrder = async (event) => {
  console.info(`[order.api.checkOrder] Event: ${JSON.stringify(event)}`)

  try {
    const result = await orderSvc.getOrder(event.userId, event.orderId)
    return result
  } catch (error) {
    console.error(`[order.api.checkOrder] Error: ${JSON.stringify(error)}`)
    return error
  }
}

api.updateOrderStatus = async (event) => {
  console.info(`[order.api.updateOrderStatus] Event: ${JSON.stringify(event)}`)

  try {
    const result = await orderSvc.updateStatus(event.userId, event.orderId)
    return result
  } catch (error) {
    console.error(`[order.api.updateOrderStatus] Error: ${JSON.stringify(error)}`)
    return error
  }
}

module.exports = api