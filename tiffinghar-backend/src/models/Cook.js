const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  nameNe:      String,
  description: String,
  price:       { type: Number, required: true },
  category:    { type: String, enum: ['veg', 'nonveg', 'vegan'], default: 'veg' },
  image:       String,
  available:   { type: Boolean, default: true },
})

const cookSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  nameNe:      String,
  bio:         String,
  bioNe:       String,
  avatar:      String,
  coverImage:  String,
  phone:       String,
  location: {
    address:   String,
    area:      String,
    city:      { type: String, default: 'Kathmandu' },
    lat:       Number,
    lng:       Number,
  },
  specialties: [String],   // ['Newari', 'Thakali', 'Dal Bhat']
  badges:      [String],   // ['Verified', 'Vegetarian', 'Organic']
  menu:        [menuItemSchema],
  deliveryRadius: { type: Number, default: 5 },  // km
  minOrder:    { type: Number, default: 100 },
  deliveryFee: { type: Number, default: 0 },
  isOpen:      { type: Boolean, default: true },
  isVerified:  { type: Boolean, default: false },
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  bankDetails: {
    accountName:   String,
    accountNumber: String,
    bankName:      String,
  },
  openHours: {
    open:  { type: String, default: '07:00' },
    close: { type: String, default: '20:00' },
  },
}, { timestamps: true })

// Virtual: distance (set dynamically per query)
cookSchema.virtual('distance').get(function() { return this._distance })
cookSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Cook', cookSchema)
