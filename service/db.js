const mongoose = require('mongoose')

mongoose.connect('mongodb://rikroy.iptime.org:27017/whatap')

const db = mongoose.connection

db.on('error', () => {
  console.og('Connection failed!')
})

db.on('open', () => {
  console.log('mongodb Connected!')
})

// product를 db object type에서 return object type으로 변경
function productSpread(r) {
  return {
    productIndex: r.productIndex,
    quantity: r.quantity,
  }
}

// order를 db object type에서 return object type으로 변경
function orderSpread(r) {
  return {
    id: r.id,
    orderAt: r.orderAt,
    updateAt: r.updateAt,
    products: r.products.map((product) => productSpread(product)),
    status: r.status,
  }
}

const order = mongoose.Schema({
  orderAt: Date,
  updateAt: Date,
  products: [
    {
      productIndex: Number,
      quantity: Number,
    },
  ],
  status: String, // ordered, inProcess, inDelevery, completed, cancled
})

const Order = mongoose.model('order', order)

// 주문 전체 조회
async function getOrders() {
  const results = await Order.find({})

  return results.map((r) => orderSpread(r))
}

// 주문 조회
async function getOrder(orderId) {
  const result = await Order.findById(orderId)
  if (result === null) return null
  return orderSpread(result)
}

// 상품 주문
async function orderProduct(products) {
  const result = await Order.create({
    orderAt: new Date(),
    updateAt: new Date(),
    products,
    status: 'ordered',
  })

  return orderSpread(result)
}

// 주문 취소
async function orderCancle(orderId) {
  await Order.findByIdAndUpdate(orderId, {
    status: 'cancled',
    updateAt: new Date(),
  })
  const result = await Order.findById(orderId)

  return orderSpread(result)
}

// 주문 수정
async function updateOrder(orderId, products, status) {
  await Order.findByIdAndUpdate(orderId, {
    products,
    status,
    updateAt: new Date(),
  })
  const result = await Order.findById(orderId)
  return orderSpread(result)
}

module.exports = { getOrders, orderProduct, getOrder, orderCancle, updateOrder }
