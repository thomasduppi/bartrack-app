import './App.css'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { SeancePage } from './pages/app/Seance'
import { HistoriquePage } from './pages/app/Historique'
import { PerformancePage } from './pages/app/Performance'
import { ComptePage } from './pages/app/Compte'
import { EntrainementPage } from './pages/app/Entrainement'
import { ProgrammeCreerPage } from './pages/app/ProgrammeCreer'
import { AddExercices } from './pages/app/AddExercices'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { Login } from './pages/connexion/Login'
import { RegisterPage } from './pages/connexion/Register'
import { ForgotPasswordPage } from './pages/connexion/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/connexion/ResetPasswordPage'
import { Test } from './pages/Test'

function AppLayout() {
  const { pathname } = useLocation()
  const showHeader = !pathname.startsWith('/app')
  const showBottomNav = pathname.startsWith('/app')

  return (
    <div className={["min-h-screen bg-black m-0 p-0", showBottomNav ? "pb-20" : "pb-0"].join(" ")}>
      {showHeader ? <Header /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Navigate to="/app/seance" replace />} />
        <Route path="/app/seance" element={<SeancePage />} />
        <Route path="/app/entrainement" element={<EntrainementPage />} />
        <Route path="/app/programme/creer" element={<ProgrammeCreerPage />} />
        <Route path="/app/add-exercices" element={<AddExercices />} />
        <Route path="/app/historique" element={<HistoriquePage />} />
        <Route path="/app/performance" element={<PerformancePage />} />
        <Route path="/app/compte" element={<ComptePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path='/test' element={<Test />} />
      </Routes>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
