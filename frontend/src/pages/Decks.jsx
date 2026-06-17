import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CardEditor from '../components/CardEditor'
import {Plus} from "lucide-react";
import {Play} from "lucide-react";
import {Edit} from "lucide-react";
import { Upload } from "lucide-react";


function Decks() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [stats, setStats] = useState({})
  const [due, setDue] = useState(0)
  const [total, setTotal] = useState(0)
  const [menuCard, setMenuCard] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [newCard, setNewCard] = useState({ front: "", back: "", card_type: "basic" })
  const [options, setOptions] = useState([
    { text: '', correct: true },
    { text: '', correct: false }
  ])

const criarCard = () => {
    if (!newCard.front.trim() && !newCard.back.trim()) return

    const body = { ...newCard }
    if (newCard.card_type === 'multiple_choice') {
      body.options = options.filter(o => o.text.trim())
    }

    fetch(`/api/decks/${id}/cards/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(() => {
      setShowModal(false)
      setNewCard({ front: "", back: "", card_type: "basic" })
      setOptions([{ text: '', correct: true }, { text: '', correct: false }])
      fetchDeck(page)
    })
  }

  const deletarCard = (cardId) => {
    fetch(`/api/deck/${id}/cards/${cardId}/delete`, { method: "POST" })
      .then(() => {
        fetchDeck(page)
      })
  }


  const fetchDeck = (p = 1) => {
    fetch(`/api/decks/${id}?page=${p}`)
      .then(res => res.json())
      .then(data => {
        setDeck(data.deck)
        setCards(data.cards)
        setStats(data.stats || {})
        setDue(data.due || 0)
        setTotal(data.total || 0)
        setTotalPages(data.total_pages || 1)
        setPage(p)
      })
  }

  useEffect(() => {
    fetchDeck(1)
  }, [id])

  const toggleEditMode = (value) => {
    setEditMode(value)
    if (value) setShowTable(true)
  }


  if (!deck) return <p className="p-8 text-gray-500">Carregando...</p>

  return (
    <div>
      <Navbar editMode={editMode} setEditMode={toggleEditMode} />

      {/* Header */}
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-800">{deck.name}</h1>
        <div className="flex gap-3 mt-2 text-sm flex-wrap">
          <span className="bg-gray-200 px-3 py-1 rounded-lg">{total} cards</span>
          <span className="bg-purple-200 px-3 py-1 rounded-lg">{due} para revisar</span>
          <span className="bg-green-200 px-3 py-1 rounded-lg">{stats.mastered || 0} dominados</span>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-4 px-8 mb-6">

        <button 
          onClick={() => setShowModal(true)}
          className="bg-white shadow rounded-xl p-6 flex items-center justify-center hover:scale-105 transition w-20 h-20">
          <Plus className='w-6 h-6'/>
        </button>

        <button 
          onClick={() => navigate(`/deck/${id}/study`)}
          className="bg-purple-700 shadow rounded-xl p-6 flex items-center justify-center hover:scale-105 transition w-20 h-20">
          <Play className='w-6 h-6'/>
        </button>

        <button
          onClick={() => setShowTable(!showTable)} 
          className="bg-gray-100 shadow rounded-xl p-6 flex items-center justify-center 
          hover:scale-105 transition w-20 h-20">
          <Edit className='w-6 h-6'/>
        </button>

        <label className="bg-white shadow rounded-xl p-6 flex items-center justify-center 
          hover:scale-105 transition w-20 h-20 cursor-pointer">
          <Upload className="w-6 h-6" />
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return

              const formData = new FormData()
              formData.append("csv_file", file)

              fetch(`/api/decks/${id}/cards/import`, {
                method: "POST",
                body: formData
              })
              .then(res => res.json())
              .then(data => {
                console.log("resposta import:", data)
                fetchDeck(page)
                e.target.value = ""
              })
            }}
          />
        </label>

      </div>



      {/* Lista de cards */}
      {showTable && (
        <div className="px-8">
          <table className="w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Frente</th>
                <th className="border p-2 text-left">Verso</th>
                {editMode && <th className="border p-2 w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="border p-2">{card.id}</td>
                  <td className="border p-2" dangerouslySetInnerHTML={{ __html: card.front }} />
                  <td className="border p-2" dangerouslySetInnerHTML={{ __html: card.back }} />
                  {editMode && (
                    <td className="border p-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => deletarCard(card.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-lg text-xs">
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTable && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4 pb-8">
          <button
            onClick={() => fetchDeck(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40">
            ← Anterior
          </button>
          <span className="text-gray-500 text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => fetchDeck(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40">
            Próxima →
          </button>
        </div>
      )}


      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Card</h2>

            {/* Tipo do card */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setNewCard(prev => ({ ...prev, card_type: 'basic' }))}
                className={`flex-1 py-2 rounded-lg border-2 font-bold transition ${newCard.card_type === 'basic' ? 'bg-purple-700 border-purple-700 text-white' : 'border-gray-200 text-gray-500'}`}>
                📝 Básico
              </button>
              <button
                onClick={() => setNewCard(prev => ({ ...prev, card_type: 'multiple_choice' }))}
                className={`flex-1 py-2 rounded-lg border-2 font-bold transition ${newCard.card_type === 'multiple_choice' ? 'bg-purple-700 border-purple-700 text-white' : 'border-gray-200 text-gray-500'}`}>
                🔤 Múltipla Escolha
              </button>
            </div>

            <CardEditor
              onChange={(html) =>
                setNewCard(prev => ({
                  ...prev,
                  front: html
                }))
              }
              placeholder="Frente do card..."
            />

            {/* Alternativas */}
            {newCard.card_type === 'multiple_choice' && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Alternativas</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={opt.correct}
                      onChange={() => setOptions(options.map((o, j) => ({ ...o, correct: i === j })))}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => setOptions(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                      placeholder={`Alternativa ${i + 1}`}
                      className="border w-full p-2 rounded-xl"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setOptions([...options, { text: '', correct: false }])}
                  className="text-purple-600 text-sm font-bold mt-1">
                  + Adicionar alternativa
                </button>
              </div>
            )}

            <CardEditor
              onChange={(html) =>
                setNewCard(prev => ({
                  ...prev,
                  back: html
                }))
              }
              placeholder="Verso do card..."
            />  

            <button onClick={criarCard}
              className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition mb-2">
              Criar
            </button>
            <button onClick={() => setShowModal(false)}
              className="w-full border py-3 rounded-xl hover:bg-gray-100 transition">
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}



export default Decks