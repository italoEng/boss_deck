import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Decks from './pages/Decks'
import Cards from './pages/Cards'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deck/:id" element={<Decks />} />
        <Route path="/deck/:id/study" element={<Cards />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App