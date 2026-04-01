// Run: node src/seed.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Cook = require('./models/Cook')

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected')

  await User.deleteMany({}); await Cook.deleteMany({})

  const user1 = await User.create({ name: 'Maya Didi', phone: '+9779801234567', role: 'cook', isVerified: true })
  const user2 = await User.create({ name: 'Sarita Auntie', phone: '+9779801234568', role: 'cook', isVerified: true })
  const user3 = await User.create({ name: 'Ram Bhai', phone: '+9779801234569', role: 'cook', isVerified: true })

  await Cook.create({
    user: user1._id, name: 'Maya Didi', nameNe: 'माया दिदी',
    bio: 'Authentic Newari home cooking with fresh local ingredients.',
    bioNe: 'ताजा स्थानीय सामग्रीसहित प्रामाणिक नेवारी घरेलु खाना।',
    avatar: '👩', location: { address: 'Baneshwor-10', area: 'Baneshwor', city: 'Kathmandu', lat: 27.6939, lng: 85.3157 },
    specialties: ['Newari', 'Dal Bhat'], badges: ['Verified', 'Home Cook', 'Newari Special'],
    rating: 4.9, totalReviews: 142, isVerified: true, isOpen: true,
    menu: [
      { name: 'Dal Bhat Set', nameNe: 'दाल भात सेट', price: 180, category: 'veg', available: true },
      { name: 'Wo', nameNe: 'वो', price: 120, category: 'veg', available: true },
      { name: 'Chatamari', nameNe: 'चतामरी', price: 150, category: 'veg', available: true },
      { name: 'Yomari', nameNe: 'योमरी', price: 100, category: 'veg', available: true },
    ],
  })

  await Cook.create({
    user: user2._id, name: 'Sarita Auntie', nameNe: 'सरिता आन्टी',
    bio: 'Pure vegetarian meals. Weekly subscription plans available.',
    bioNe: 'शुद्ध शाकाहारी खाना। साप्ताहिक सदस्यता उपलब्ध।',
    avatar: '👩‍🍳', location: { address: 'Koteshwor-32', area: 'Koteshwor', city: 'Kathmandu', lat: 27.6847, lng: 85.3444 },
    specialties: ['Vegetarian', 'Dal Bhat'], badges: ['Verified', 'Vegetarian Only'],
    rating: 4.7, totalReviews: 98, isVerified: true, isOpen: true,
    menu: [
      { name: 'Roti Tarkari', nameNe: 'रोटी तरकारी', price: 150, category: 'veg', available: true },
      { name: 'Khichdi', nameNe: 'खिचडी', price: 130, category: 'veg', available: true },
      { name: 'Sabji Set', nameNe: 'सब्जी सेट', price: 140, category: 'veg', available: true },
    ],
  })

  await Cook.create({
    user: user3._id, name: 'Ram Bhai', nameNe: 'राम भाई',
    bio: 'Authentic Thakali cuisine from Mustang.',
    bioNe: 'मुस्ताङबाट प्रामाणिक थकाली खाना।',
    avatar: '🧑‍🍳', location: { address: 'Tinkune-4', area: 'Tinkune', city: 'Kathmandu', lat: 27.6915, lng: 85.3412 },
    specialties: ['Thakali'], badges: ['Verified', 'Thakali Special'],
    rating: 4.6, totalReviews: 61, isVerified: true, isOpen: true,
    menu: [
      { name: 'Thakali Set', nameNe: 'थकाली सेट', price: 220, category: 'nonveg', available: true },
      { name: 'Gundruk Set', nameNe: 'गुन्द्रुक सेट', price: 180, category: 'veg', available: true },
      { name: 'Dhido Set', nameNe: 'ढिडो सेट', price: 160, category: 'veg', available: true },
    ],
  })

  console.log('✅ Seeded 3 cooks')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
