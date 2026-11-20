import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

function Master() {
  return (
    <>
    <Header/>
    <main className="no-scrollbar" style={{ overflowY: 'auto', height: 'calc(100vh - var(--header-min-height))' }}>
        <Outlet/>
    </main>
    </>
  )
}

export default Master