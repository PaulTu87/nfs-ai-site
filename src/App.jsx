import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BackgroundCanvas from "./components/BackgroundCanvas";
import { useReveal } from "./hooks/useReveal";

export default function App() {
  useReveal();
  return (
    <>
      <BackgroundCanvas />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}
