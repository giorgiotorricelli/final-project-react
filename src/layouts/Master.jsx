import { Outlet } from "react-bootstrap-icons";
import Header from "../components/Header.jsx";

function Master() {
  return (
    <>
    <Header/>
    <main>
        <Outlet/>
    </main>
    </>
  )
}

export default Master