export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
}

export interface CategoryItem {
  id: number
  name: string
}

export interface BookItem {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  description: string | null
  stock: number
  coverImage: string | null
  isEbook: boolean
  category: { id: number; name: string }
  _count?: { transactions: number }
}

export interface TransactionItem {
  id: number
  borrowDate: string
  dueDate: string
  returnDate: string | null
  fine: number
  status: string
  user: { id: number; name: string; email: string }
  book: { id: number; title: string; author: string }
}

export interface BookingItem {
  id: number
  code: string
  status: string
  createdAt: string
  expiresAt: string
  user?: { id: number; name: string; email: string }
  book: { id: number; title: string; author: string }
}

export interface MemberItem {
  id: number
  name: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: string
  _count: { transactions: number }
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface PaginationMeta {
  page: number
  total: number
  totalPages: number
}
