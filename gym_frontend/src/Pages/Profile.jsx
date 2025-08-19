import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroPages from "../components/hero-pages/HeroPages";
import SecondaryHeading from "../components/headings/SecondaryHeading";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(user);
      
      // Fetch member data from database
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email)
        .single();
      
      if (error) {
        setError("Failed to load profile data");
        console.error("Error fetching member data:", error);
      } else {
        setMemberData(data);
      }
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <main>
        <HeroPages page="Profile" />
        <section className="px-6 py-32">
          <div className="container text-center">
            <p className="text-gray-200">Loading profile...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <HeroPages page="Profile" />
        <section className="px-6 py-32">
          <div className="container text-center">
            <p className="text-red">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <HeroPages page="Profile" />
      <section className="px-6 py-32">
        <div className="container grid place-items-center">
          <div className="w-full max-w-2xl bg-gray-50 px-5 py-8">
            <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
              My Profile
            </SecondaryHeading>

            {memberData && (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">First Name</h3>
                    <p className="text-lg font-semibold">{memberData.firstname}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Last Name</h3>
                    <p className="text-lg font-semibold">{memberData.lastname}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Email</h3>
                    <p className="text-lg font-semibold break-words max-w-full">{memberData.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Phone</h3>
                    <p className="text-lg font-semibold">{memberData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Join Date</h3>
                    <p className="text-lg font-semibold">{new Date(memberData.joindate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Date of Birth</h3>
                    <p className="text-lg font-semibold">
                      {memberData.dateofbirth ? new Date(memberData.dateofbirth).toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Gender</h3>
                    <p className="text-lg font-semibold">
                      {memberData.gender === "M" ? "Male" : memberData.gender === "F" ? "Female" : memberData.gender === "O" ? "Other" : "Not provided"}
                    </p>
                  </div>
                </div>
                
                {memberData.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Address</h3>
                    <p className="text-lg font-semibold">{memberData.address}</p>
                  </div>
                )}

                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleSignOut}
                    className="bg-red px-8 py-4 font-semibold uppercase text-white hover:bg-red/90 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
