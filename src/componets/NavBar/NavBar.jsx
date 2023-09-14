import { Link } from "react-router-dom";
import SearchBar from "../searchbar/searchbar";


const NavBar = () => {
  function loaderpage() {
    window.location.reload()
  }

  return (
    <div >
      <a href="https://github.com/SebastianAsprino/" target="_blank" rel="noopener noreferrer">
        <button>
          GitHub
        </button>
      </a>
      <Link to="/form">
        <button>
          Add Pokemon
        </button>
      </Link>
      <button onClick={loaderpage}>
        HOME
      </button>
      <div>
      <SearchBar />
      </div>
    </div>
  );
};

export default NavBar;
