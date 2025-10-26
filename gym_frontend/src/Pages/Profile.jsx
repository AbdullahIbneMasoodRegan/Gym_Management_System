import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroPages from "../components/hero-pages/HeroPages";
import SecondaryHeading from "../components/headings/SecondaryHeading";
import { supabase } from "../lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [metrics, setMetrics] = useState([]); // store health metrics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false); // toggle form visibility
  const [newMetric, setNewMetric] = useState({ recorddate: "", weight: "", height: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(user);

      // Fetch member data
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email)
        .single();

      if (memberError) {
        setError("Failed to load profile data");
        console.error("Error fetching member data:", memberError);
        setLoading(false);
        return;
      }

      setMemberData(member);

      // Fetch health metrics for this member
      const { data: metricsData, error: metricsError } = await supabase
        .from("healthmetrics")
        .select("*")
        .eq("memberid", member.memberid) // match with PK
        .order("recorddate", { ascending: true });

      if (metricsError) {
        console.error("Error fetching health metrics:", metricsError);
      } else {
        setMetrics(metricsData || []);
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const hMeters = height / 100; // assume cm input
    return (weight / (hMeters * hMeters)).toFixed(2);
  };

  const bmiData = metrics.map((m) => ({
    date: new Date(m.recorddate).toLocaleDateString(),
    bmi: parseFloat(calculateBMI(m.weight, m.height)),
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMetric(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!memberData) return;

    setAdding(true);
    const { data, error } = await supabase
      .from("healthmetrics")
      .insert([{ ...newMetric, memberid: memberData.memberid }])
      .select()
      .single();

    if (error) {
      console.error("Error adding metric:", error);
    } else {
      setMetrics(prev => [...prev, data]); // add new metric to state
      setShowForm(false); // hide form
      setNewMetric({ recorddate: "", weight: "", height: "", notes: "" }); // reset form
    }

    setAdding(false);
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
            {/* Profile Info */}
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
              </div>
            )}

            {/* Health Metrics Section */}
            {/* Health Metrics Section */}
  <div className="mt-12">
    <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
     My Health Metrics
    </SecondaryHeading>

    {/* Toggle Add Metric Form */}
    <div className="flex justify-end">
    <button
      onClick={() => setShowForm(prev => !prev)}
      className="mb-4 bg-red text-white px-6 py-2 transition-colors"
    >
      {showForm ? "Cancel" : "Add New Record"}
    </button>
    </div>


              {showForm && (
                <form onSubmit={handleAddMetric} className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        name="recorddate"
                        value={newMetric.recorddate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={newMetric.weight}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="height"
                        value={newMetric.height}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={newMetric.notes}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="bg-red text-white px-6 py-2 hover:bg-red transition-colors"
                  >
                    {adding ? "Adding..." : "Add Record"}
                  </button>
                </form>
              )}

              {metrics.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {metrics.map((m) => (
                    <div key={m.metricid} className="p-4 border rounded-lg bg-white shadow-sm">
                      <p><span className="font-semibold">Date:</span> {new Date(m.recorddate).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Weight:</span> {m.weight} kg</p>
                      <p><span className="font-semibold">Height:</span> {m.height} cm</p>
                      <p><span className="font-semibold">BMI:</span> {calculateBMI(m.weight, m.height)}</p>
                      {m.notes && <p><span className="font-semibold">Notes:</span> {m.notes}</p>}
                    </div>
                  ))}

                  {/* BMI Chart */}
                  <div className="mt-8">
                    <SecondaryHeading textColor="black" bgColor="white" uppercase={false}>
                      BMI Over Time
                    </SecondaryHeading>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bmiData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bmi" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-gray-500">No health metrics recorded yet.</p>
              )}
            </div>

            {/* Sign out button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSignOut}
                className="bg-red px-8 py-4 font-semibold uppercase text-white hover:bg-red/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
