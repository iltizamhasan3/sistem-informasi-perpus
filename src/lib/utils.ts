export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const fineRate = Number(process.env.FINE_RATE) || 2000

export function calculateFine(dueDate: Date, returnDate?: Date | null) {
  const end = new Date(returnDate || new Date())
  const due = new Date(dueDate)
  
  // Normalisasi waktu ke tengah malam agar membandingkan tanggal kalender secara murni
  end.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = end.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays * fineRate : 0
}

export const BORROW_DURATION_DAYS = 7

