import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'

export default function Cooks() {
  const { lang, cooks, orders, toast } = useApp()
  const [selectedCook, setSelectedCook] = useState(null)
  const [showBecomeForm, setShowBecomeForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', area: '', specialty: '' })
  const [submitted, setSubmitted] = useState(false)

  const savedCooks = cooks.filter(c => c.saved)
  const totalSpent = orders.reduce((s, o) => s + o.price, 0)
  const cooksTried = [...new Set(orders.map(o => o.cookId))].length

  const stats = [
    { label: lang === 'ne' ? 'कुल अर्डर' : 'Total orders', val: orders.length },
    { label: lang === 'ne' ? 'पकाउने जनाहरू' : 'Cooks tried', val: cooksTried },
    { label: lang === 'ne' ? 'कुल खर्च' : 'Total spent', val: `Rs. ${totalSpent.toLocaleString()}` },
    { label: lang === 'ne' ? 'सेभ गरिएका' : 'Saved cooks', val: savedCooks.length },
  ]

  const handleSubmit = () => {
    if (!form.name || !form.phone) {
      toast(lang === 'ne' ? 'नाम र फोन आवश्यक छ' : 'Name and phone required', 'error')
      return
    }
    setSubmitted(true)
    toast(lang === 'ne' ? 'आवेदन पठाइयो! हामी सम्पर्क गर्नेछौं।' : 'Application sent! We\'ll contact you.')
    setTimeout(() => { setSubmitted(false); setShowBecomeForm(false); setForm({ name: '', phone: '', area: '', specialty: '' }) }, 2000)
  }

  return (
    <>
      <div className="px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className="text-xl font-medium text-gray-900">{s.val}</div>
            </div>
          ))}
        </div>

        {/* Saved cooks */}
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          {lang === 'ne' ? 'सेभ गरिएका पकाउने' : 'Your Saved Cooks'}
          {savedCooks.length === 0 && (
            <span className="ml-2 text-gray-300 normal-case font-normal">
              {lang === 'ne' ? '(हृदय थिचेर सेभ गर्नुस्)' : '(tap ❤️ to save)'}
            </span>
          )}
        </div>

        {savedCooks.length === 0 ? (
          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl mb-3">
            <div className="text-2xl mb-1">🤍</div>
            <div className="text-sm">{lang === 'ne' ? 'कुनै सेभ गरिएको छैन' : 'No saved cooks yet'}</div>
          </div>
        ) : (
          savedCooks.map(cook => (
            <CookCard key={cook.id} cook={cook} onViewDetail={setSelectedCook} />
          ))
        )}

        {/* Become a cook CTA */}
        <div
          className="border border-dashed border-gray-300 rounded-xl p-3.5 cursor-pointer hover:border-[#C0392B] transition-colors mt-2"
          onClick={() => setShowBecomeForm(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EAF3DE] flex items-center justify-center text-xl flex-shrink-0">+</div>
            <div>
              <div className="text-[15px] font-medium text-gray-900">
                {lang === 'ne' ? 'पकाउने बन्नुस्' : 'Become a Cook'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {lang === 'ne' ? 'घरबाटै Rs. १५,०००–२५,०००/महिना कमाउनुस्' : 'Earn Rs. 15,000–25,000/month from home'}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11]">
              {lang === 'ne' ? 'साइनअप खुला छ' : 'Open for signup'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#185FA5]">
              {lang === 'ne' ? 'निःशुल्क' : 'Free to join'}
            </span>
          </div>
        </div>
      </div>

      {/* Become a cook modal */}
      {showBecomeForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowBecomeForm(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-base font-medium text-gray-900">
                  {lang === 'ne' ? 'आवेदन पठाइयो!' : 'Application Sent!'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {lang === 'ne' ? 'हामी छिट्टै सम्पर्क गर्नेछौं।' : "We'll contact you soon."}
                </div>
              </div>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-900 mb-1">🍳 {lang === 'ne' ? 'पकाउने बन्नुस्' : 'Become a Cook'}</div>
                <p className="text-sm text-gray-500 mb-4">
                  {lang === 'ne' ? 'आफ्नो घरबाटै खाना पकाएर कमाउनुस्।' : 'Cook from home and earn. We handle delivery and payments.'}
                </p>
                <div className="space-y-3">
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                    placeholder={lang === 'ne' ? 'तपाईंको नाम *' : 'Your name *'}
                  />
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                    placeholder={lang === 'ne' ? 'फोन नम्बर *' : 'Phone number *'}
                    type="tel"
                  />
                  <input
                    value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                    placeholder={lang === 'ne' ? 'ठेगाना / क्षेत्र' : 'Address / Area'}
                  />
                  <input
                    value={form.specialty}
                    onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                    placeholder={lang === 'ne' ? 'विशेषता (जस्तै: नेवारी, थकाली)' : 'Specialty (e.g. Newari, Thakali)'}
                  />
                  <button onClick={handleSubmit} className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                    {lang === 'ne' ? 'आवेदन दिनुस्' : 'Apply Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <CookDetailModal cook={selectedCook} onClose={() => setSelectedCook(null)} />
    </>
  )
}
