import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Cards() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(null) // index da alternativa escolhida

  const fetchCard = (idx) => {
    fetch(`/api/decks/${id}/study?index=${idx}`)
      .then(res => res.json())
      .then(data => {
        if (data.done) {
          setDone(true)
        } else {
          setCard(data.card)
          setIndex(data.index)
          setTotal(data.total)
          setRevealed(false)
          setAnswered(null)
        }
      })
  }

  useEffect(() => { fetchCard(0) }, [id])

  const review = (quality) => {
    fetch(`/api/decks/${id}/cards/${card.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality, next_index: index + 1 })
    })
    .then(res => res.json())
    .then(data => {
      if (data.done) setDone(true)
      else fetchCard(data.next_index)
    })
  }

  const responderAlternativa = (optionIndex, correct) => {
    if (answered !== null) return
    setAnswered(optionIndex)
    setRevealed(true)
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-5xl mb-4">🎉</p>
      <p className="text-2xl font-bold text-green-600">Sessão concluída!</p>
      <button onClick={() => navigate(`/deck/${id}`)}
        className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition">
        Ver Baralho
      </button>
    </div>
  )

  if (!card) return <p className="p-8 text-gray-500">Carregando...</p>

  return (
    <div>
      <Navbar />
      <div className="text-center text-gray-500 text-sm mt-4">
        {total - index} restantes
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 mx-auto mt-8">
        
        {/* Frente */}
        <div className="text-center text-2xl font-semibold text-gray-800"
          dangerouslySetInnerHTML={{ __html: card.front }} />

        {/* Múltipla escolha */}
        {card.card_type === 'multiple_choice' && card.options && (
          <div className="mt-8 flex flex-col gap-3">
            {card.options.map((option, i) => {
              let cls = "flex-1 border border-gray-200 px-4 py-3 rounded-xl text-left transition"
              if (answered !== null) {
                if (option.correct) cls += " bg-green-100 border-green-500"
                else if (i === answered && !option.correct) cls += " bg-red-100 border-red-500"
              } else {
                cls += " hover:bg-indigo-50 hover:border-indigo-300"
              }
              return (
                <button key={i} onClick={() => responderAlternativa(i, option.correct)}
                  className={cls} disabled={answered !== null}>
                  {option.text}
                </button>
              )
            })}
          </div>
        )}

        {/* Verso */}
        {revealed && (
          <div className="mt-4 text-center text-xl text-gray-600"
            dangerouslySetInnerHTML={{ __html: card.back }} />
        )}

        {/* Card básico - botão revelar */}
        {card.card_type !== 'multiple_choice' && !revealed && (
          <div className="flex justify-center mt-6">
            <button onClick={() => setRevealed(true)}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition">
              Mostrar resposta
            </button>
          </div>
        )}

        {/* Botões de avaliação */}
        {revealed && (
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => review(0)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-red-200 transition">Errei</button>
            <button onClick={() => review(3)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-yellow-200 transition">Difícil</button>
            <button onClick={() => review(5)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-green-200 transition">Fácil</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cards