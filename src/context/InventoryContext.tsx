import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { InventoryImportState } from '../types/inventory'

type InventoryContextValue = {
  importState: InventoryImportState | null
  setImportState: (state: InventoryImportState | null) => void
  resetToUpload: () => void
  toggleReviewed: (id: string) => void
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [importState, setImportState] = useState<InventoryImportState | null>(
    null,
  )

  const resetToUpload = useCallback(() => {
    setImportState(null)
  }, [])

  const toggleReviewed = useCallback((id: string) => {
    setImportState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        products: prev.products.map((p) =>
          p.recordId === id ? { ...p, reviewed: !p.reviewed } : p,
        ),
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      importState,
      setImportState,
      resetToUpload,
      toggleReviewed,
    }),
    [importState, resetToUpload, toggleReviewed],
  )

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) {
    throw new Error('useInventory must be used within InventoryProvider')
  }
  return ctx
}
