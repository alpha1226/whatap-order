function send(res, text) {
  res.setHeader('content-type', 'application/json')
  res.status(200).send(text)
}

function json(res, obj) {
  res.setHeader('content-type', 'application/json')
  res.status(200).json(obj)
}

function badReq(res, txt) {
  res.setHeader('content-type', 'application/json')
  res.status(400).send(txt)
}

function serverError(res, txt) {
  res.setHeader('content-type', 'application/json')
  res.status(500).send(txt)
}

function serverErrorWithObject(res, txt, obj) {
  res.setHeader('content-type', 'application/json')
  res.status(500).json({
    message: txt,
    object: obj,
  })
}

module.exports = { send, json, badReq, serverError, serverErrorWithObject }
