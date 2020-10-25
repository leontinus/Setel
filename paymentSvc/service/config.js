// config.js

module.exports = {
  ddbTable: {
    orderTable: process.env.DYNAMODB_ORDER_TABLE,
    paymentTable: process.env.DYNAMODB_PAYMENT_TABLE
  },
  lambdaName: {
    updateOrderStatus: process.env.ORDER_UPDATE_ORDER_STATUS
  }
}