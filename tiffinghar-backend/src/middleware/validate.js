const { validationResult } = require('express-validator')

exports.validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  return res.status(400).json({
    success: false,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request payload',
    details: errors.array(),
  })
}
