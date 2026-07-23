import { Navigate, Route, Routes } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import { UploadPage } from './pages/UploadPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <InventoryProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </InventoryProvider>
  )
}
