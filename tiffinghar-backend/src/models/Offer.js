const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  title:       String,
  titleNe:     String,
  description: String,
  type:        { type: String, enum: ['percent', 'flat', 'free_delivery'], required: true },
  value:       Number,           // percent off or flat amount
  minOrder:    { type: Number, default: 0 },
  maxDiscount: Number,           // cap for percent discounts
  usageLimit:  { type: Number, default: 100 },
  usedCount:   { type: Number, default: 0 },
  userLimit:   { type: Number, default: 1 },  // per user
  validFrom:   Date,
  validUntil:  Date,
  isActive:    { type: Boolean, default: true },
  forNewUsers: { type: Boolean, default: false },
  image:       String,
}, { timestamps: true })

module.exports = mongoose.model('Offer', offerSchema)
