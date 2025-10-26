import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const linkStyles = "hover:text-red focus:text-red focus";

function NavLinks({ onToggleNav, styles }) {
  const { user, logout } = useAuth();

  return (
    <ul className={styles}>
      <li>
        <Link to="/" className={linkStyles} onClick={onToggleNav}>
          Home
        </Link>
      </li>
      <li>
        <Link to="/about" className={linkStyles} onClick={onToggleNav}>
          About
        </Link>
      </li>
      <li>
        <Link to="/schedule" className={linkStyles} onClick={onToggleNav}>
          Schedule
        </Link>
      </li>
      <li>
        <Link to="/pricing" className={linkStyles} onClick={onToggleNav}>
          Pricing
        </Link>
      </li>
      <li>
        <Link to="/classes" className={linkStyles} onClick={onToggleNav}>
          Classes
        </Link>
      </li>
      {!user ? (
        <>
          <li>
            <Link to="/login" className={linkStyles} onClick={onToggleNav}>
              Login
            </Link>
          </li>
          <li>
            <Link to="/signup" className={linkStyles} onClick={onToggleNav}>
              Signup
            </Link>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link to="/profile" className={linkStyles} onClick={onToggleNav}>
              My Profile
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className={linkStyles}
              onClick={async (e) => {
                e.preventDefault();
                await logout();
                onToggleNav();
                window.location.href = "/";
              }}
            >
              Logout
            </Link>
          </li>
        </>
      )}
      <li>
        <Link to="/contact" className={linkStyles} onClick={onToggleNav}>
          Contact
        </Link>
      </li>
      <li>
        <Link to="/admin-login" className={linkStyles} onClick={onToggleNav}>
          Admin Login
        </Link>
      </li>
    </ul>
  );
}

export default NavLinks;