import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CardEditor from '../components/CardEditor'
import {Plus} from "lucide-react";
import {Play} from "lucide-react";
import {Edit} from "lucide-react";


function Decks() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [stats, setStats] = useState({})
  const [due, setDue] = useState(0)
  const [total, setTotal] = useState(0)
  const [showTable, setShowTable] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newCard, setNewCard] = useState({ front: "", back: "", card_type: "basic" })

  const criarCard = () => {
    if (!newCard.front.trim() && !newCard.back.trim()) return
    fetch(`/api/decks/${id}/cards/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard)
    })
    .then(res => res.json())
    .then(() => {

      setShowModal(false);

      setNewCard({
        front: "",
        back: "",
        card_type: "basic"
      });

      fetch(`/api/decks/${id}`)
        .then(res => res.json())
        .then(data => {

          setDeck(data.deck);
          setCards(data.cards);
          setStats(data.stats || {});
          setDue(data.due || 0);
          setTotal(data.total || 0);

        });

    })
  }

  useEffect(() => {
    fetch(`/api/decks/${id}`)
      .then(res => res.json())
      .then(data => {
        setDeck(data.deck)
        setCards(data.cards)
        setStats(data.stats || {})
        setDue(data.due || 0)
        setTotal(data.total || 0)
      })
  }, [id])

  if (!deck) return <p className="p-8 text-gray-500">Carregando...</p>

  return (
    <div>
      <Navbar />

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
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="border p-2">{card.id}</td>
                  <td className="border p-2" dangerouslySetInnerHTML={{ __html: card.front }} />
                  <td className="border p-2" dangerouslySetInnerHTML={{ __html: card.back }} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Card</h2>
            <CardEditor
              onChange={(html) =>
                setNewCard(prev => ({
                  ...prev,
                  front: html
                }))
              }
            />

            <textarea
              placeholder="Verso"
              value={newCard.back}
              onChange={e => setNewCard({ ...newCard, back: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
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