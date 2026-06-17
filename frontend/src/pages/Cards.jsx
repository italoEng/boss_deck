import { useEffect, useState, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MathJaxBaseContext } from "better-react-mathjax";
import Navbar from '../components/Navbar'

function MathJaxHtml({ html, className }) {
  const containerRef = useRef(null)
  const mjContext = useContext(MathJaxBaseContext)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = html || ''
    if (!mjContext?.promise) return

    let isMounted = true
    mjContext.promise.then((mathJax) => {
      if (!isMounted || !container) return
      if (typeof mathJax.typesetPromise === 'function') {
        mathJax.typesetPromise([container]).catch(console.error)
      } else if (typeof mathJax.typeset === 'function') {
        mathJax.typeset([container])
      }
    }).catch(console.error)

    return () => {
      isMounted = false
    }
  }, [html, mjContext])

  const classNames = ['math-content', className].filter(Boolean).join(' ')
  return <div ref={containerRef} className={classNames} />
}

function Cards() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(null)
  const [loading, setLoading] = useState(true)
  const [crossed, setCrossed] = useState([])

  const shuffle = (items) => {
    const array = [...items]
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  useEffect(() => {
    fetch(`/api/decks/${id}/study`)
      .then(res => res.json())
      .then(data => {
        if (data.done || !data.cards.length) {
          setDone(true)
        } else {
          setCards(shuffle(data.cards))
        }
        setLoading(false)
      })
  }, [id])

  const card = cards[index]
  const total = cards.length

  const renderCardContent = (html, className = '') => (
    <MathJaxHtml html={html} className={className} />
  )

  const review = (quality) => {
    fetch(`/api/decks/${id}/cards/${card.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality })
    })
    .then(() => {
      const next = index + 1
      if (next >= total) {
        setDone(true)
      } else {
        setIndex(next)
        setRevealed(false)
        setAnswered(null)
        setCrossed([])
      }
    })
  }

  const responderAlternativa = (optionIndex) => {
    if (answered !== null) return
    setAnswered(optionIndex)
    setRevealed(true)
  }

  if (loading) return <p className="p-8 text-gray-500">Carregando...</p>

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

  if (!card) return null

  console.log("CARD COMPLETO:", card)
  console.log("CARD TYPE:", card.card_type)
  console.log("CARD OPTIONS:", card.options)

  return (
    <div>
      <Navbar />
      <div className="text-center text-gray-500 text-sm mt-4">
        {total - index} restantes
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 mx-auto mt-8">
        <div className="text-center text-2xl font-semibold text-gray-800">
          {renderCardContent(card.front)}
        </div>

        {card.card_type === 'multiple_choice' && card.options && (
          <div className="mt-8 flex flex-col gap-3">
            {card.options.map((option, i) => {
              let cls = "flex-1 border border-gray-200 px-4 py-3 rounded-xl text-left transition flex items-center justify-between gap-2"
              if (answered !== null) {
                if (option.correct) cls += " bg-green-100 border-green-500"
                else if (i === answered && !option.correct) cls += " bg-red-100 border-red-500"
              } else if (crossed.includes(i)) {
                cls += " opacity-40 bg-gray-50"
              } else {
                cls += " hover:bg-indigo-50 hover:border-indigo-300"
              }
              return (
                <div key={i} className="flex items-center gap-2">
                  {/* botão de riscar */}
                  {answered === null && (
                    <button
                      onClick={() => setCrossed(prev =>
                        prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                      )}
                      className="text-gray-300 hover:text-red-400 transition text-lg font-bold"
                      title="Riscar alternativa">
                      ✕
                    </button>
                  )}

                  <button
                    onClick={() => responderAlternativa(i)}
                    className={cls}
                    disabled={answered !== null}>
                    <MathJaxHtml html={option.text} />
                    {crossed.includes(i) && answered === null && (
                      <span className="text-gray-400 text-lg">✕</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {revealed && (
          <div className="mt-4 text-center text-xl text-gray-600">
            {renderCardContent(card.back)}
          </div>
        )}

        {card.card_type !== 'multiple_choice' && !revealed && (
          <div className="flex justify-center mt-6">
            <button onClick={() => setRevealed(true)}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition">
              Mostrar resposta
            </button>
          </div>
        )}

        {revealed && (
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => review(0)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-red-200 transition">Errei</button>
            <button onClick={() => review(5)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-green-200 transition">Fácil</button>
            <button onClick={() => review(3)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-yellow-200 transition">Difícil</button>
          </div>
        )}
      </div>
    </div>
  )
  console.log("CARD FRONT:", card.front);
  console.log("CARD BACK:", card.back);
}

export default Cards