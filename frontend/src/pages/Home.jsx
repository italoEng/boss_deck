import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import DeckCard from "../components/DeckCard";
import Heatmap from "../components/Heatmap";

function Home() {

  const carouselRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [decks, setDecks] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [newDeck, setNewDeck] = useState({ name: "", description: "" })

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction * 600,
      behavior: "smooth",
    });
  };

  const fetchDecks = () => {
  fetch("http://localhost:5000/api/decks")
    .then((res) => res.json())
    .then((data) => {
      setDecks(data.decks);
      setHeatmap(data.heatmap);
    });
  };

  const criarDeck = () => {
    if (!newDeck.name.trim()) return;
    fetch("http://localhost:5000/api/decks/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDeck)
    })
    .then(res => res.json())
    .then(() => {
      setShowModal(false);
      setNewDeck({ name: "", description: "" });
      fetchDecks();
    });
  };

    useEffect(() => {
    fetch("http://localhost:5000/api/decks")
      .then((res) => res.json())
      .then((data) => {
        setDecks(data.decks);
        setHeatmap(data.heatmap);
      });
  }, []);



  return (
    <div>
      <Navbar
        editMode={editMode}
        setEditMode={setEditMode}
      />

      <div className="flex items-center justify-center gap-4 p-8">

        {/* seta esquerda */}
        <button
          onClick={() => scrollCarousel(-1)}
          className="
            text-4xl
            hover:text-purple-700
            transition
            shrink-0">
            ‹
          </button>        

        {/* Novo deck fixo */}
        <div
          onClick={() => setShowModal(true)}
          className="
            w-45
            h-60
            border-2 border-dashed
            rounded-xl
            flex items-center justify-center
            cursor-pointer
            hover:bg-gray-100
            hover:border-purple-500
            transition-all duration-300
            shrink-0
          "
        >

          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-gray-500">
              Novo Deck
            </span>
          </div>
        </div>


        {/* carousel */}
        <div
          ref={carouselRef}
          className="
            flex gap-4
            overflow-x-hidden
            scroll-smooth
            w-155
            pb-2
          "
        >
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              editMode={editMode}
            />
          ))}
        </div>

        {/* seta direita */}
        <button
          onClick={() => scrollCarousel(1)}
          className="
            text-4xl
            hover:text-purple-700
            transition
            shrink-0
          "
        >
          ›
        </button>

      </div>

      <Heatmap data={heatmap} />

      {/* Modal novo deck */}
      {showModal && (
        <div 
          className="
            fixed inset-0 
            bg-black/40
            backdrop-blur-sm 
            flex items-center 
            justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Baralho</h2>
            <input
              type="text"
              placeholder="Nome"
              value={newDeck.name}
              onChange={e => setNewDeck({ ...newDeck, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={newDeck.description}
              onChange={e => setNewDeck({ ...newDeck, description: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={criarDeck}
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
  );
}

export default Home;