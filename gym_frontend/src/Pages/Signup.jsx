// src/Pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeroPages from "../components/hero-pages/HeroPages";
import SecondaryHeading from "../components/headings/SecondaryHeading";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/profile", { replace: true });
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("members").insert([{
      firstname: firstName,
      lastname: lastName,
      email,
      phone,
      joindate: new Date().toISOString().split("T")[0],
      dateofbirth: dob || null,
      gender: gender || null,
      address: address || null,
    }]);

    setLoading(false);
    if (dbError) setError(dbError.message);
    else navigate("/login", { replace: true });
  }

  return (
    <main>
      <HeroPages page="Signup" />
      <section className="px-6 py-32">
        <div className="container grid place-items-center">
          <form onSubmit={handleSignup} className="w-full max-w-md bg-gray-50 px-5 py-8">
            <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
              Create your account
            </SecondaryHeading>

            {error && <p className="mb-4 text-red text-sm">* {error}</p>}

            <div className="flex flex-col gap-4">
              <input className="focus border border-gray-100 px-4 py-2" placeholder="Email*" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="focus border border-gray-100 px-4 py-2" type="password" placeholder="Password*" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input className="focus border border-gray-100 px-4 py-2" placeholder="First Name*" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input className="focus border border-gray-100 px-4 py-2" placeholder="Last Name*" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input className="focus border border-gray-100 px-4 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="focus border border-gray-100 px-4 py-2" type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} />
              <select className="focus border border-gray-100 px-4 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
              </select>
              <textarea className="focus border border-gray-100 px-4 py-2 h-32 max-h-44" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

              <button type="submit" disabled={loading} className="self-center bg-red px-8 py-4 font-semibold uppercase text-white">
                {loading ? "Creating..." : "Sign Up"}
              </button>

              <p className="text-center text-gray-200">
                Already have an account? <Link to="/login" className="underline">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}