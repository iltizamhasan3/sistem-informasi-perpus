'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: number
  title: string
  author: string
  coverImage: string | null
  stock: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sipustaka-cart')
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {}
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sipustaka-cart', JSON.stringify(cart))
    }
  }, [cart, mounted])

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      if (prev.find((p) => p.id === item.id)) return prev
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
    setCartOpen(true)
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isCartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
