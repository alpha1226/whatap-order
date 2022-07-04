const express = require('express')
const response = require('../util/response')

const router = express.Router()

const db = require('../service/db')
const {
  productValidation,
  productUpdate,
  cancleProductOrder,
  getProductInfo,
} = require('../service/product')

router.get('/', (req, res) => {
  res.send('order server')
})

router.get('/getOrders', async (req, res) => {
  const orders = await db.getOrders()
  return response.json(res, orders)
})

router.get('/getOrder/:orderId', async (req, res) => {
  const { orderId } = req.params
  const order = await db.getOrder(orderId)
  return response.json(res, order)
})

router.post('/orderProduct', async (req, res) => {
  const { products } = req.body

  try {
    const productValidationResult = await Promise.all(
      await products.map(async (e) =>
        productValidation(e.productIndex, e.quantity)
      )
    )

    if (productValidationResult.includes(false)) {
      throw new Error('failed order product, contains invalid products')
    }

    productValidationResult.forEach(async (e) => {
      const newProduct = {
        ...e,
        productIndex: e.product_index,
        stock: e.stock - products.find((r) => r.id === e.id).quantity,
      }
      await productUpdate(newProduct)
    })

    const data = await db.orderProduct(products)

    return response.json(res, data)
  } catch (err) {
    console.log(err)
    return response.serverError(res, err.message)
  }
})

router.put('/changeOrder/:orderId', async (req, res) => {
  const { orderId } = req.params
  const { products } = req.body

  // 주문번호 확인 및 상태 확인
  const order = await db.getOrder(orderId)

  if (order === null) {
    return response.serverError(res, 'can not find order')
  }
  if (order.status === 'cancled') {
    return response.send(res, 'already cancled order')
  }
  if (order.status !== 'ordered') {
    return response.serverError(
      res,
      `can not cancle this order, already ${order.status}`
    )
  }

  // 상품 재고량 확인
  const productStock = await Promise.all(
    products.map(async (e) => {
      const productInfo = await getProductInfo(e.productIndex)
      return productInfo
    })
  )

  if (productStock.includes(undefined)) {
    return response.serverError(res, '구매가 불가능한 상품이 포함되어있습니다')
  }

  const newOrderProducts = productStock.map((e) => {
    // 주문에 이미 들어가있는 갯수 확인
    const inOrderQuantity = order.products.find(
      (r) => r.productIndex === e.productIndex
    ).quantity

    const newQuantity = products.find(
      (r) => r.productIndex === e.productIndex
    ).quantity

    // 상품 재고 + 주문에 포함된 갯수 < 새로 주문할 수량
    if (e.stock + inOrderQuantity < newQuantity) {
      return false
    }
    return { ...e, stock: e.stock - newQuantity + inOrderQuantity }
  })

  if (newOrderProducts.includes(false)) {
    return response.serverError(res, '구매 가능 수량을 초과한 제품이 있습니다')
  }

  // 변경 상품 재고 반영
  newOrderProducts.forEach(async (e) => {
    await productUpdate(e)
  })

  // 주문 수정
  const updateOrderResult = await db.updateOrder(
    orderId,
    products,
    order.status
  )

  return response.json(res, updateOrderResult)
})

router.delete('/deleteOrder/:orderId', async (req, res) => {
  const { orderId } = req.params
  // 주문 번호 확인 및 상태 확인
  const order = await db.getOrder(orderId)

  if (order === null) {
    return response.serverError(res, 'can not find order')
  }
  if (order.status === 'cancled') {
    return response.send(res, 'already cancled order')
  }
  if (order.status !== 'ordered') {
    return response.serverError(
      res,
      `can not cancle this order, already ${order.status}`
    )
  }

  // 주문 취소 업데이트
  const cancleResult = await db.orderCancle(orderId)

  // 각 상품 수량 변경
  cancleResult.products.forEach(async (e) => {
    await cancleProductOrder(e.productIndex, e.quantity)
  })

  return response.json(res, cancleResult)
})

module.exports = router
