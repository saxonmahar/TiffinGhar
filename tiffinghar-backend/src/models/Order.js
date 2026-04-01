const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId },
  name:      String,
  nameNe:    String,
  price:     Number,
  qty:       Number,
})

const orderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cook:      { type: mongoose.Schema.Types.ObjectId, ref: 'Cook', required: true },
  items:     [orderItemSchema],
  subtotal:  Number,
  deliveryFee: { type: Number, default: 0 },
  total:     Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'onway', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status:    String,
    time:      { type: Date, default: Date.now },
    note:      String,
  }],
  progress: { type: Number, default: 0 },
  deliveryAddress: {
    label:  String,
    detail: String,
    lat:    Number,
    lng:    Number,
  },
  paymentMethod: {
    type: String,
    enum: ['esewa', 'khalti', 'cash'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentRef:   String,
  couponCode:   String,
  discount:     { type: Number, default: 0 },
  estimatedTime: Number,  // minutes
  notes:        String,
  rated:        { type: Boolean, default: false },
  scheduledFor: Date,     // for pre-orders
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
