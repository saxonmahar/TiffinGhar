// Run: node src/seed.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Cook = require('./models/Cook')
const Offer = require('./models/Offer')

const COOKS_DATA = [
  {
    name: 'Maya Didi', nameNe: 'माया दिदी', phone: '+9779801234567',
    bio: 'Authentic Newari home cooking with fresh local ingredients. 15+ years of experience.',
    bioNe: 'ताजा स्थानीय सामग्रीसहित प्रामाणिक नेवारी घरेलु खाना। १५+ वर्षको अनुभव।',
    avatar: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop',
    location: { address: 'Baneshwor-10', area: 'Baneshwor', city: 'Kathmandu', lat: 27.6939, lng: 85.3157 },
    specialties: ['Newari', 'Dal Bhat'],
    badges: ['Verified', 'Home Cook', 'Newari Special'],
    rating: 4.9, totalReviews: 142, deliveryTime: '30-40 min',
    menu: [
      { name: 'Dal Bhat Set', nameNe: 'दाल भात सेट', price: 180, category: 'veg', available: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop' },
      { name: 'Wo', nameNe: 'वो', price: 120, category: 'veg', available: true },
      { name: 'Chatamari', nameNe: 'चतामरी', price: 150, category: 'veg', available: true },
      { name: 'Yomari', nameNe: 'योमरी', price: 100, category: 'veg', available: true },
      { name: 'Bara', nameNe: 'बरा', price: 80, category: 'veg', available: true },
    ],
  },
  {
    name: 'Sarita Auntie', nameNe: 'सरिता आन्टी', phone: '+9779801234568',
    bio: 'Pure vegetarian meals cooked with love. Weekly subscription plans available.',
    bioNe: 'मायाले पकाएको शुद्ध शाकाहारी खाना। साप्ताहिक सदस्यता उपलब्ध।',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=300&fit=crop',
    location: { address: 'Koteshwor-32', area: 'Koteshwor', city: 'Kathmandu', lat: 27.6847, lng: 85.3444 },
    specialties: ['Vegetarian', 'Dal Bhat'],
    badges: ['Verified', 'Vegetarian Only'],
    rating: 4.7, totalReviews: 98, deliveryTime: '25-35 min',
    menu: [
      { name: 'Roti Tarkari', nameNe: 'रोटी तरकारी', price: 150, category: 'veg', available: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&h=150&fit=crop' },
      { name: 'Khichdi', nameNe: 'खिचडी', price: 130, category: 'veg', available: true },
      { name: 'Sabji Set', nameNe: 'सब्जी सेट', price: 140, category: 'veg', available: true },
      { name: 'Pulao', nameNe: 'पुलाउ', price: 160, category: 'veg', available: true },
    ],
  },
  {
    name: 'Ram Bhai', nameNe: 'राम भाई', phone: '+9779801234569',
    bio: 'Authentic Thakali cuisine from Mustang. Traditional recipes passed down through generations.',
    bioNe: 'मुस्ताङबाट प्रामाणिक थकाली खाना। पुस्तौंदेखि चल्दै आएका परम्परागत रेसिपीहरू।',
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=300&fit=crop',
    location: { address: 'Tinkune-4', area: 'Tinkune', city: 'Kathmandu', lat: 27.6915, lng: 85.3412 },
    specialties: ['Thakali'],
    badges: ['Verified', 'Thakali Special'],
    rating: 4.6, totalReviews: 61, deliveryTime: '35-45 min',
    menu: [
      { name: 'Thakali Set', nameNe: 'थकाली सेट', price: 220, category: 'nonveg', available: true, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&h=150&fit=crop' },
      { name: 'Gundruk Set', nameNe: 'गुन्द्रुक सेट', price: 180, category: 'veg', available: true },
      { name: 'Dhido Set', nameNe: 'ढिडो सेट', price: 160, category: 'veg', available: true },
      { name: 'Sekuwa', nameNe: 'सेकुवा', price: 250, category: 'nonveg', available: true },
    ],
  },
  {
    name: 'Kamala Didi', nameNe: 'कमला दिदी', phone: '+9779801234570',
    bio: 'Organic ingredients, healthy home meals. Specializes in diet-friendly tiffin boxes.',
    bioNe: 'जैविक सामग्री, स्वस्थ घरेलु खाना। आहार-अनुकूल टिफिन बक्समा विशेषज्ञता।',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=300&fit=crop',
    location: { address: 'Lazimpat-2', area: 'Lazimpat', city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
    specialties: ['Organic', 'Dal Bhat'],
    badges: ['Verified', 'Organic', 'Home Cook'],
    rating: 4.8, totalReviews: 77, deliveryTime: '40-50 min',
    menu: [
      { name: 'Dal Bhat', nameNe: 'दाल भात', price: 200, category: 'veg', available: true },
      { name: 'Momo', nameNe: 'मोमो', price: 150, category: 'veg', available: true, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=150&fit=crop' },
      { name: 'Chowmein', nameNe: 'चाउमिन', price: 130, category: 'veg', available: true },
      { name: 'Fried Rice', nameNe: 'फ्राइड राइस', price: 140, category: 'veg', available: true },
    ],
  },
  {
    name: 'Sunita Bhabi', nameNe: 'सुनिता भाभी', phone: '+9779801234571',
    bio: 'Specializes in Momo and Chowmein. Fresh ingredients daily from local market.',
    bioNe: 'मोमो र चाउमिनमा विशेषज्ञता। दैनिक स्थानीय बजारबाट ताजा सामग्री।',
    avatar: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=300&fit=crop',
    location: { address: 'Patan-5', area: 'Patan', city: 'Lalitpur', lat: 27.6644, lng: 85.3188 },
    specialties: ['Momo', 'Chowmein'],
    badges: ['Verified', 'Home Cook'],
    rating: 4.5, totalReviews: 43, deliveryTime: '20-30 min',
    menu: [
      { name: 'Buff Momo', nameNe: 'बफ मोमो', price: 160, category: 'nonveg', available: true, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=150&fit=crop' },
      { name: 'Veg Momo', nameNe: 'भेज मोमो', price: 130, category: 'veg', available: true },
      { name: 'Chowmein', nameNe: 'चाउमिन', price: 120, category: 'veg', available: true },
      { name: 'Fried Momo', nameNe: 'फ्राइड मोमो', price: 180, category: 'nonveg', available: true },
    ],
  },
  {
    name: 'Bishnu Dai', nameNe: 'विष्णु दाई', phone: '+9779801234572',
    bio: 'Traditional Nepali breakfast specialist. Sel roti, chiura, and more.',
    bioNe: 'परम्परागत नेपाली बिहानको खाना विशेषज्ञ। सेल रोटी, चिउरा र अरू।',
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop',
    location: { address: 'Bhaktapur-3', area: 'Bhaktapur', city: 'Bhaktapur', lat: 27.6710, lng: 85.4298 },
    specialties: ['Breakfast', 'Newari'],
    badges: ['Verified', 'Newari Special'],
    rating: 4.4, totalReviews: 29, deliveryTime: '45-55 min',
    menu: [
      { name: 'Sel Roti Set', nameNe: 'सेल रोटी सेट', price: 120, category: 'veg', available: true },
      { name: 'Chiura Tarkari', nameNe: 'चिउरा तरकारी', price: 100, category: 'veg', available: true },
      { name: 'Aloo Tama', nameNe: 'आलु तामा', price: 140, category: 'veg', available: true },
      { name: 'Kwati', nameNe: 'क्वाँटी', price: 130, category: 'veg', available: true },
    ],
  },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI, { tls: true })
  console.log('Connected to MongoDB')

  // Clear existing data
  await User.deleteMany({})
  await Cook.deleteMany({})
  await Offer.deleteMany({})
  console.log('Cleared existing data')

  // Create cooks
  for (const cookData of COOKS_DATA) {
    const user = await User.create({
      name: cookData.name,
      phone: cookData.phone,
      role: 'cook',
      isVerified: true,
    })

    await Cook.create({
      user: user._id,
      name: cookData.name,
      nameNe: cookData.nameNe,
      bio: cookData.bio,
      bioNe: cookData.bioNe,
      avatar: cookData.avatar,
      coverImage: cookData.coverImage,
      location: cookData.location,
      specialties: cookData.specialties,
      badges: cookData.badges,
      rating: cookData.rating,
      totalReviews: cookData.totalReviews,
      deliveryTime: cookData.deliveryTime,
      isVerified: true,
      isOpen: true,
      menu: cookData.menu,
    })
  }
  console.log(`✅ Seeded ${COOKS_DATA.length} cooks`)

  // Seed offers
  await Offer.insertMany([
    { code: 'TIFFIN20', title: '20% off first order', titleNe: 'पहिलो अर्डरमा २०% छुट', type: 'percent', value: 20, maxDiscount: 100, minOrder: 150, forNewUsers: true, description: 'Get 20% off on your first order. Max discount Rs. 100' },
    { code: 'FLAT50', title: 'Rs. 50 off', titleNe: 'Rs. ५० छुट', type: 'flat', value: 50, minOrder: 200, description: 'Flat Rs. 50 off on orders above Rs. 200' },
    { code: 'FREEDEL', title: 'Free Delivery', titleNe: 'निःशुल्क डेलिभरी', type: 'free_delivery', value: 0, minOrder: 100, description: 'Free delivery on any order' },
    { code: 'NEWARI10', title: '10% off Newari food', titleNe: 'नेवारी खानामा १०% छुट', type: 'percent', value: 10, minOrder: 180, description: '10% off on Newari cuisine orders' },
    { code: 'WELCOME', title: 'Welcome bonus', titleNe: 'स्वागत बोनस', type: 'flat', value: 30, minOrder: 100, description: 'Rs. 30 off on your first order' },
  ])
  console.log('✅ Seeded 5 offers')

  console.log('\n🎉 Database seeded successfully!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
