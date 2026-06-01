import React from "react";
import ReactDOM from "react-dom/client";
import { MathJaxContext } from "better-react-mathjax";
import "./index.css";
import App from "./App";

const config = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <MathJaxContext config={config}>
    <App />
  </MathJaxContext>
);