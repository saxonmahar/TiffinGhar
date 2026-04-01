// Food alias map — maps search terms to what we actually have
// If someone searches "burger", we show them the closest home-cooked alternative
const FOOD_ALIASES = {
  // Fast food → home food alternatives
  burger:     { suggest: 'Dal Bhat', reason: "We don't have burgers, but try our home-cooked Dal Bhat!" },
  pizza:      { suggest: 'Roti Tarkari', reason: "No pizza here, but fresh Roti Tarkari is even better!" },
  pasta:      { suggest: 'Chowmein', reason: "Try our homemade Chowmein instead!" },
  sandwich:   { suggest: 'Roti', reason: "Fresh homemade Roti is our version of a sandwich!" },
  noodles:    { suggest: 'Chowmein', reason: null },
  rice:       { suggest: 'Dal Bhat', reason: null },
  curry:      { suggest: 'Tarkari', reason: null },
  soup:       { suggest: 'Dal', reason: null },
  dumpling:   { suggest: 'Momo', reason: null },
  // Nepali food variations
  dalbhat:    { suggest: 'Dal Bhat', reason: null },
  'dal bhat': { suggest: 'Dal Bhat', reason: null },
  thakali:    { suggest: 'Thakali Set', reason: null },
  newari:     { suggest: 'Newari', reason: null },
  momo:       { suggest: 'Momo', reason: null },
  chowmein:   { suggest: 'Chowmein', reason: null },
  roti:       { suggest: 'Roti', reason: null },
  khichdi:    { suggest: 'Khichdi', reason: null },
  biryani:    { suggest: 'Pulao', reason: "Try our homemade Pulao — similar and delicious!" },
  fried:      { suggest: 'Fried Rice', reason: null },
  // Nepali script
  'दाल':      { suggest: 'Dal Bhat', reason: null },
  'मोमो':     { suggest: 'Momo', reason: null },
  'रोटी':     { suggest: 'Roti', reason: null },
}

// Get the normalized search term and any alias suggestion
export const resolveSearch = (query) => {
  const q = query.toLowerCase().trim()
  if (!q) return { term: '', alias: null, suggestion: null }

  // Direct alias match
  if (FOOD_ALIASES[q]) {
    return { term: FOOD_ALIASES[q].suggest, alias: q, suggestion: FOOD_ALIASES[q].reason }
  }

  // Partial alias match
  for (const [key, val] of Object.entries(FOOD_ALIASES)) {
    if (q.includes(key) || key.includes(q)) {
      return { term: val.suggest, alias: q, suggestion: val.reason }
    }
  }

  return { term: q, alias: null, suggestion: null }
}

// Smart filter — searches across name, meals, menu, specialties, location
export const smartFilter = (cooks, query) => {
  if (!query) return { results: cooks, suggestion: null, resolvedTerm: null }

  const { term, alias, suggestion } = resolveSearch(query)
  const q = term.toLowerCase()

  const results = cooks.filter(cook => {
    // Name match
    if (cook.name?.toLowerCase().includes(q)) return true
    if (cook.nameNe?.includes(q)) return true

    // Location match
    const loc = typeof cook.location === 'object' ? cook.location?.area : cook.location
    if (loc?.toLowerCase().includes(q)) return true

    // Specialties match
    if (cook.specialties?.some(s => s.toLowerCase().includes(q))) return true
    if (cook.badges?.some(b => {
      const label = typeof b === 'string' ? b : b.label
      return label?.toLowerCase().includes(q)
    })) return true

    // Menu items match (API format: cook.menu[])
    if (cook.menu?.some(m => m.name?.toLowerCase().includes(q) || m.nameNe?.includes(q))) return true

    // Meals match (mock format: cook.meals[])
    if (cook.meals?.some(m => m.toLowerCase().includes(q))) return true
    if (cook.mealsNe?.some(m => m.includes(q))) return true

    return false
  })

  // If no results with resolved term, try original query
  if (results.length === 0 && alias) {
    const fallback = cooks.filter(cook =>
      cook.name?.toLowerCase().includes(query.toLowerCase()) ||
      cook.meals?.some(m => m.toLowerCase().includes(query.toLowerCase())) ||
      cook.menu?.some(m => m.name?.toLowerCase().includes(query.toLowerCase()))
    )
    if (fallback.length > 0) return { results: fallback, suggestion: null, resolvedTerm: null }
  }

  return {
    results,
    suggestion: alias && results.length > 0 ? suggestion : null,
    resolvedTerm: alias && results.length > 0 ? term : null,
  }
}
