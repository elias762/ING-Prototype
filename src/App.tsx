import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projekte from './pages/Projekte'
import ProjektDetail from './pages/ProjektDetail'
import Angebote from './pages/Angebote'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projekte" element={<Projekte />} />
        <Route path="projekte/:id" element={<ProjektDetail />} />
        <Route path="angebote" element={<Angebote />} />
      </Route>
    </Routes>
  )
}

export default App
