const AWS = require('aws-sdk')
const {ddbTable} = require('./config')

class orderSvc {
  constructor () {
    this.ddbClient = new AWS.DynamoDB.DocumentClient()
  }
  /**
   * Create Order
   */
  async create (userId, orderInfo) {
    console.info(`[order.svc.create] User ID: ${userId}`)

    try {
      const orderId = this._uuidGenerator()
      const params = {
        TableName: ddbTable.orderTable,
        Item : {
          PK: orderId,
          SK: userId,
          orderStatus: 'CREATED',
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          typeName: orderInfo.type
        }
      }
      const result = await this.ddbClient.put(params).promise().then(
        (data) => {
          return {
            statusCode: 200,
            body: JSON.stringify(
              {
                message: `Order ${JSON.stringify(orderId)} created`,
                input: orderInfo,
              },
              null,
              2
            ),
          }
        },
        (error) => {
          throw error
        }
      )
      return result
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
      const result = await this.ddbClient.update(params).promise().then(
        (data) => {
          return {
            statusCode: 200,
            body: JSON.stringify(
              {
                message: `Order ${orderId} has been cancelled`
              },
              null,
              2
            ),
          }
        },
        (error) => {
          throw error
        }
      )
      return result
    } catch (error) {
      console.error(`[order.svc.cancel] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }

  /**
   * Check Order
   */
  async getOrder (userId, orderId) {
    console.info(`[order.svc.getOrder] Order ID: ${orderId}`)

    try {
      const params = {
        TableName: ddbTable.orderTable,
        Key: {
          PK: orderId,
          SK: userId
        }
      }
      const result = await this.ddbClient.get(params).promise().then(
        (data) => {
          return {
            statusCode: 200,
            body: JSON.stringify(
              {
                message: `Order ${orderId} found`,
                Item: {
                  UserId: data.Item.createdBy,
                  OrderID: data.Item.orderId,
                  Status: data.Item.orderStatus
                }
              },
              null,
              2
            ),
          }
        },
        (error) => {
          throw error
        }
      )
      return result
    } catch (error) {
      console.error(`[order.svc.getOrder] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }

  /**
   * Update order status
   */
  async updateStatus (userId, orderId) {
    console.info(`[order.svc.updateStatus] Order ID: ${orderId}`)

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
          ':status' : 'DELIVERED'
        }
      }
      const result = await this.ddbClient.update(params).promise().then(
        (data) => {
          return {
            statusCode: 200,
            body: JSON.stringify(
              {
                message: `Order ${orderId} completed`
              },
              null,
              2
            ),
          }
        },
        (error) => {
          throw error
        }
      )
      return result
    } catch (error) {
      console.error(`[order.svc.updateStatus] Error: ${JSON.stringify(error)}`)
      throw error
    }
  }

  _uuidGenerator = () => {
    let dt = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (dt + Math.random()*16)%16 | 0
      dt = Math.floor(dt/16)
      return (c === 'x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
  }
}

module.exports = orderSvc
