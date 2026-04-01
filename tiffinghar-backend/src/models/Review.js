const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cook:    { type: mongoose.Schema.Types.ObjectId, ref: 'Cook', required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images:  [String],
}, { timestamps: true })

// After save, update cook's average rating
reviewSchema.post('save', async function() {
  const Cook = require('./Cook')
  const stats = await this.constructor.aggregate([
    { $match: { cook: this.cook } },
    { $group: { _id: '$cook', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (stats.length > 0) {
    await Cook.findByIdAndUpdate(this.cook, {
      rating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    })
  }
})

module.exports = mongoose.model('Review', reviewSchema)
