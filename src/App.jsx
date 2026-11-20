import { Route, Routes } from "react-router-dom";
import Master from "./layouts/Master.jsx";
import Homepage from "./pages/Homepage.jsx";
import AllMovies from "./pages/AllMovies.jsx";
import AllActors from "./pages/AllActors.jsx";
import AllDirectors from "./pages/AllDirectors.jsx";
import Movie from "./pages/Movie.jsx";
import Actor from "./pages/Actor.jsx";
import Director from "./pages/Director.jsx";
import Vault from "./pages/Vault.jsx";


function App() {


  return (
    <Routes>
      <Route element={<Master/>}>
        <Route index element={<Homepage/>}/>
        <Route path="/movies" element={<AllMovies/>}/>
        <Route path="/movies/:slug" element={<Movie/>}/>
        <Route path="/actors" element={<AllActors/>}/>
        <Route path="/actors/:id" element={<Actor/>}/>
        <Route path="/directors" element={<AllDirectors/>}/>
        <Route path="/directors/:id" element={<Director/>}/>
        <Route path="/vault" element={<Vault/>}/>
      </Route>
    </Routes>
  )
}

export default App
