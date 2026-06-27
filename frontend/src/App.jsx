import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import Decks from './pages/Decks'
import Cards from './pages/Cards'
import Login from './pages/Login'

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (session === undefined) return <p className="p-8 text-gray-500">Carregando...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Home /> : <Navigate to="/login" />} />
        <Route path="/deck/:id" element={session ? <Decks /> : <Navigate to="/login" />} />
        <Route path="/deck/:id/study" element={session ? <Cards /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App