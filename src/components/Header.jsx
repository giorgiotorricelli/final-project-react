import { ThreeDotsVertical, List } from "react-bootstrap-icons";
import { Link, NavLink } from "react-router-dom";

function Header() {
  return (
    <header className=" d-flex justify-content-between align-items-center px-2">
      <h1 className=" title-font m-0"><Link id="logo" to={'/'} onClick={logoAnimation} 
      className=" text-decoration-none text-black">M.U.V</Link></h1>
      <nav className="d-none d-sm-flex align-items-center gap-3">
        <NavLink to={'/vault'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Vault</h5>
        </NavLink>
        <NavLink to={'/movies'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Movies</h5>
        </NavLink>
        <NavLink to={'/actors'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Actors</h5>
        </NavLink>
        <NavLink to={'/directors'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Directors</h5>
        </NavLink>
      </nav>
      <div className="dropdown d-sm-none">
        <button className="btn dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <List style={{fontSize: "1.5rem"}}/>
        </button>
        <ul className="dropdown-menu p-2 " style={{backgroundColor: "#ffffffe3"}}>
          <NavLink to={'/vault'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Vault</h5>
        </NavLink>
        <NavLink to={'/movies'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Movies</h5>
        </NavLink>
        <NavLink to={'/actors'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Actors</h5>
        </NavLink>
        <NavLink to={'/directors'} className={({isActive})=> `base-nav-link ${isActive ? 'nav-link-active' : ''}`} >
          <h5 className=" m-0">Directors</h5>
        </NavLink>
        </ul>
      </div>
    </header>
    
  )
}

function logoAnimation() {
  const logo = document.getElementById('logo');
  logo.classList.add('lift');
  setTimeout(() => {
    logo.classList.remove('lift');
  }, 1000);
}

export default Header