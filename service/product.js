const fetch = require('node-fetch')

const productServerUrl = 'http://localhost:3000'
const getProductUrl = `${productServerUrl}/getProduct/`
const updateProductUrl = `${productServerUrl}/updateProduct/`

async function productValidation(productIndex, quantity) {
  const getProductInfoResult = await fetch(`${getProductUrl}${productIndex}`, {
    method: 'get',
  })

  if (getProductInfoResult.status !== 200) return false

  const product = await getProductInfoResult.json()

  if (product.available && product.stock >= quantity) {
    return product
  }
  return false
}

async function productUpdate(product) {
  await fetch(`${updateProductUrl}${product.product_index}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })
  return true
}

async function cancleProductOrder(productIndex, quantity) {
  const productInfoResult = await fetch(`${getProductUrl}${productIndex}`, {
    method: 'get',
  })
  let product = await productInfoResult.json()
  if (product.object) {
    product = product.object
  }
  product.productIndex = product.product_index
  product.stock += quantity

  const updateResult = await fetch(`${updateProductUrl}${productIndex}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })
  return updateResult
}

async function getProductInfo(productIndex) {
  const productInfoResult = await fetch(`${getProductUrl}${productIndex}`, {
    method: 'get',
  })
  if (productInfoResult.status !== 200) return undefined

  const productInfo = await productInfoResult.json()
  if (productInfo.available === false) return undefined

  return {
    ...productInfo,
    productIndex: productInfo.product_index,
  }
}

module.exports = {
  productValidation,
  productUpdate,
  cancleProductOrder,
  getProductInfo,
}
