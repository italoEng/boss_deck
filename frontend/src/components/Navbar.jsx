import logo from "../assets/logo2.png";
import { Settings } from "lucide-react";
import {Moon} from "lucide-react";

function Navbar({ editMode, setEditMode }) {
  return (
    <nav className="bg-purple-700 border-b border-purple-800 
        px-8 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">
            <img
            src={logo}
            alt="Boss Deck"
            className="h-12 w-12 rounded"
            />
        </div>

      <div className="flex items-center gap-3">

        <button>
          <Moon className="h-6 w-6" />
        </button>

        <button onClick={() => setEditMode(!editMode)}>
          <Settings 
              className={`
              h-6 w-6 transition-transform duration-300
              ${editMode ? "rotate-90 text-white" : ""}
            `}/>
        </button>

      </div>
    </nav>
  );
}

export default Navbar;