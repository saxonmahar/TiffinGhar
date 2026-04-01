import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toasts } = useApp()

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full max-w-[380px] px-4">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg text-white animate-fade-in ${
            t.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
