import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projekte from './pages/Projekte'
import Angebote from './pages/Angebote'
import Login from './pages/Login'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="projekte" element={<Projekte />} />
        <Route path="angebote" element={<Angebote />} />
      </Route>
    </Routes>
  )
}

export default App
