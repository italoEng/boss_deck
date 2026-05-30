import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

function DeckCard({ deck, editMode }) {

  const navigate = useNavigate();

  const pct =
    deck.total > 0
      ? Math.round((deck.mastered / deck.total) * 100)
      : 0;

  return (
    <div
      onClick={() => navigate(`/deck/${deck.id}`)}
      className="
        relative
        w-[180px]
        h-[240px]
        border
        rounded-xl
        p-4
        flex flex-col justify-between
        shrink-0
        hover:shadow-lg
        transition
        cursor-pointer
      "
    >

      {/* botões */}
      {editMode && (
        <div className="absolute top-2 right-2 flex gap-2 z-20">

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              console.log(deck);
            }}
            className="
              bg-yellow-400
              p-2
              rounded-lg
              hover:scale-110
              transition
            "
          >
            <Pencil className="w-4 h-4 text-black" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              fetch(`http://localhost:5000/api/decks/${deck.id}/delete`, {
                method: "POST",
              })
              .then(() => {
                window.location.reload();
              });
            }}
            className="
              bg-red-500
              p-2
              rounded-lg
              hover:scale-110
              transition
            "
          >
            <Trash2 className="w-4 h-4 text-black" />
          </button>

        </div>
      )}

      {/* conteúdo */}
      <div className="mt-6">
        <h2 className="font-bold text-lg">
          {deck.name}
        </h2>

        <p className="text-[12px] text-gray-500 mt-2">
          {deck.description}
        </p>
      </div>

      {/* progresso */}
      <div>
        <div className="text-sm text-gray-400 mb-1">
          {pct}% dominado
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

    </div>
  );
}

export default DeckCard;