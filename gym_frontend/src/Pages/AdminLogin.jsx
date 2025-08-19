import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroPages from "../components/hero-pages/HeroPages";
import SecondaryHeading from "../components/headings/SecondaryHeading";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient"; // Add this import

export default function AdminLogin() {
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginWithRole } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Hardcoded admin login
    if (emailOrId === "admin@example.com" && password === "admin123") {
      loginWithRole("admin", null);
      navigate("/admin-dashboard");
      return;
    }

    // Trainer login
    const { data: trainer } = await supabase // Simplified destructuring
      .from("Trainers")
      .select("*")
      .or(`Email.eq.${emailOrId},TrainerID.eq.${parseInt(emailOrId)}`)
      .eq("Password", password)
      .single();

    if (trainer) {
      loginWithRole("trainer", trainer.TrainerID);
      navigate("/admin-dashboard");
      return;
    }

    // Staff login
    const { data: staff } = await supabase // Simplified destructuring
      .from("Staff")
      .select("*")
      .or(`Email.eq.${emailOrId},StaffID.eq.${parseInt(emailOrId)}`)
      .eq("Password", password)
      .single();

    if (staff) {
      loginWithRole("staff", staff.StaffID);
      navigate("/admin-dashboard");
      return;
    }

    setError("Invalid credentials or role");
    setLoading(false);
  };

  return (
    <main>
      <HeroPages page="Admin Login" />
      <section className="px-6 py-32">
        <div className="container grid place-items-center">
          <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-50 px-5 py-8">
            <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
              Admin/Trainer/Staff Login
            </SecondaryHeading>

            {error && <p className="mb-4 text-red text-sm">* {error}</p>}

            <div className="flex flex-col gap-4">
              <input
                className="focus border border-gray-100 px-4 py-2"
                type="text"
                placeholder="Email or ID*"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
              />
              <input
                className="focus border border-gray-100 px-4 py-2"
                type="password"
                placeholder="Password*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="self-center bg-red px-8 py-4 font-semibold uppercase text-white"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}