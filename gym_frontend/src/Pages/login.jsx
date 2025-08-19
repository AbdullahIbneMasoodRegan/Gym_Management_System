// src/Pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroPages from "../components/hero-pages/HeroPages";
import SecondaryHeading from "../components/headings/SecondaryHeading";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/profile", { replace: true });
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/profile", { replace: true });
  }

  return (
    <main>
      <HeroPages page="Login" />
      <section className="px-6 py-32">
        <div className="container grid place-items-center">
          <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-50 px-5 py-8">
            <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
              Welcome back
            </SecondaryHeading>

            {error && <p className="mb-4 text-red text-sm">* {error}</p>}

            <div className="flex flex-col gap-4">
              <input className="focus border border-gray-100 px-4 py-2" type="email" placeholder="Email*" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="focus border border-gray-100 px-4 py-2" type="password" placeholder="Password*" value={password} onChange={(e) => setPassword(e.target.value)} />

              <button type="submit" disabled={loading} className="self-center bg-red px-8 py-4 font-semibold uppercase text-white">
                {loading ? "Loading..." : "Login"}
              </button>

              <p className="text-center text-gray-200">
                Don’t have an account? <Link to="/signup" className="underline">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}