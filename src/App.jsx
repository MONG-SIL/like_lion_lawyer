import React, { useState } from "react";
import ApiTest from "./ApiTest";
import VillageLawyer from "./VillageLawyer";

function App() {
  const [view, setView] = useState("lawyer");

  return (
    <div>
      <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <button
          type="button"
          onClick={() => setView("lawyer")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            view === "lawyer"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          지역별 현황
        </button>
        <button
          type="button"
          onClick={() => setView("test")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            view === "test"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          API 테스트
        </button>
      </nav>
      {view === "lawyer" ? <VillageLawyer /> : <ApiTest />}
    </div>
  );
}

export default App;
