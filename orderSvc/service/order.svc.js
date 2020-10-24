const AWS = require('aws-sdk')
const {ddbTable} = require('./config')

class orderSvc {
  constructor () {
    this.ddbClient = new AWS.DynamoDB.DocumentClient()
  }
  /**
   * Create order
   */
  async create (userId, orderInfo) {
    console.info(`[order.svc.create] User ID: ${userId}`)

    try {
      const params = {
        TableName: ddbTable.orderTable,
        Item : {
          PK: orderInfo.ID,
          SK: userId,
          orderStatus: 'CREATED',
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          typeName: orderInfo.type
        }
      }
      return await this.dbClient.put(params, (error, data) => {
        if (error) throw error
        else return `Order ${JSON.stringify(orderInfo.ID)} created`
      }).promise()
    } catch (error) {
      console.error(`[order.svc.create] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }

  /**
   * Cancel Order
   */
  async cancel (userId, orderId) {
    console.info(`[order.svc.cancel] Order ID: ${orderId}`)

    try {
      const params = {
        TableName: ddbTable.orderTable,
        Key: { 
          PK : orderId,
          SK: userId 
        },
        UpdateExpression: 'set #orderStatus = :status',
        ExpressionAttributeNames: {'#orderStatus' : 'orderStatus'},
        ExpressionAttributeValues: {
          ':status' : 'CANCELLED'
        }
      }
      return await this.ddbClient.update(params, (error, data) => {
        if (error) throw error
        else return `Order ${orderId} has been cancelled`
      }).promise()
    } catch (error) {
      console.error(`[order.svc.cancel] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }
}

module.exports = orderSvc
