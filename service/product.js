const fetch = require('node-fetch')

const productServerUrl = 'http://localhost:3000'
const getProductUrl = `${productServerUrl}/getProduct/`
const updateProductUrl = `${productServerUrl}/updateProduct/`

fetch(productServerUrl, { method: 'get' })
  .then((e) => {
    console.log('connect product server success')
  })
  .catch(() => {
    console.log('connect product server failed')
  })

async function productValidation(productIndex, quantity) {
  const productInfoResult = await fetch(`${getProductUrl}${productIndex}`, {
    method: 'get',
  })
  if (productInfoResult.status !== 200) return undefined

  const productInfo = await productInfoResult.json()
  if (!productInfo.available || productInfo.stock < quantity) {
    return false
  }

  return productInfo
}

async function productUpdate(product) {
  const updateResult = await fetch(
    `${updateProductUrl}${product.productIndex}`,
    {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    }
  )
  if (updateResult.status !== 200) throw new Error('update failed')

  if ((await updateResult.json()).result === false) {
    throw new Error('update failed')
  }
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

module.exports = {
  productValidation,
  productUpdate,
  cancleProductOrder,
}
