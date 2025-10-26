import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const TrainerDashboard = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    hiredate: "",
    specialization: "",
    hourlyrate: "",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [trainersRes, branchesRes] = await Promise.all([
          supabase.from("trainers").select("*").order("hiredate", { ascending: false }),
          supabase.from("branches").select("branchid, branchname"),
        ]);

        if (trainersRes.error) throw trainersRes.error;
        if (branchesRes.error) throw branchesRes.error;

        setTrainers(trainersRes.data || []);
        setBranches(branchesRes.data || []);
      } catch (err) {
        setError("Failed to load trainer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin-login");
  };

  const handleAddTrainer = () => {
    navigate("/add-trainer");
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  // ---------- Modal & Form ----------
  const openModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setForm({
        firstname: trainer.firstname || "",
        lastname: trainer.lastname || "",
        email: trainer.email || "",
        phone: trainer.phone || "",
        hiredate: trainer.hiredate || "",
        specialization: trainer.specialization || "",
        hourlyrate: trainer.hourlyrate?.toString() || "",
      });
    } else {
      setEditingTrainer(null);
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        hiredate: "",
        specialization: "",
        hourlyrate: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      phone: form.phone || null,
      hiredate: form.hiredate,
      specialization: form.specialization || null,
      hourlyrate: form.hourlyrate ? parseFloat(form.hourlyrate) : null,
    };

    try {
      let res;
      if (editingTrainer) {
        res = await supabase
          .from("trainers")
          .update(payload)
          .eq("trainerid", editingTrainer.trainerid);
      } else {
        res = await supabase.from("trainers").insert(payload);
      }

      if (res.error) throw res.error;

      // Refresh list
      const { data } = await supabase.from("trainers").select("*");
      setTrainers(data || []);
      closeModal();
    } catch (err) {
      alert("Error saving trainer: " + err.message);
    }
  };

  const handleDelete = async (trainerid) => {
    if (!window.confirm("Are you sure you want to delete this trainer?")) return;

    try {
      const { error } = await supabase.from("trainers").delete().eq("trainerid", trainerid);
      if (error) throw error;

      setTrainers((prev) => prev.filter((t) => t.trainerid !== trainerid));
    } catch (err) {
      alert("Error deleting trainer: " + err.message);
    }
  };

  // ---------- Helper display functions ----------
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (rate) => {
    if (!rate) return "—";
    return `$${parseFloat(rate).toFixed(2)}`;
  };

  // Summary stats
  const totalTrainers = trainers.length;
  const avgRate = trainers.length > 0
    ? (trainers.reduce((sum, t) => sum + (t.hourlyrate || 0), 0) / trainers.length).toFixed(2)
    : "0.00";
  const topSpecialization = trainers.reduce((acc, t) => {
    const spec = t.specialization || "None";
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {});
  const mostCommonSpec = Object.keys(topSpecialization).reduce((a, b) =>
    topSpecialization[a] > topSpecialization[b] ? a : b, "None"
  );

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Trainers</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleBackToDashboard}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleAddTrainer}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Add Trainer
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Trainers</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalTrainers}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Avg Hourly Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">${avgRate}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Top Specialization</h3>
          <p className="text-lg font-bold text-purple-600 mt-1">{mostCommonSpec}</p>
          <p className="text-sm text-gray-500">
            {topSpecialization[mostCommonSpec]} trainers
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Hire Date</th>
              <th className="border px-4 py-2 text-left">Specialization</th>
              <th className="border px-4 py-2 text-left">Hourly Rate</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.length > 0 ? (
              trainers.map((trainer) => (
                <tr key={trainer.trainerid} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 font-medium">{trainer.trainerid}</td>
                  <td className="border px-4 py-2 font-semibold">
                    {trainer.firstname} {trainer.lastname}
                  </td>
                  <td className="border px-4 py-2">{trainer.email}</td>
                  <td className="border px-4 py-2">{trainer.phone || "—"}</td>
                  <td className="border px-4 py-2">{formatDate(trainer.hiredate)}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trainer.specialization === "Yoga"
                          ? "bg-green-100 text-green-800"
                          : trainer.specialization === "Weightlifting"
                          ? "bg-red-100 text-red-800"
                          : trainer.specialization === "Cardio"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trainer.specialization || "—"}
                    </span>
                  </td>
                  <td className="border px-4 py-2 font-medium text-green-700">
                    {formatCurrency(trainer.hourlyrate)}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openModal(trainer)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trainer.trainerid)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No trainers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Edit Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTrainer ? "Edit Trainer" : "Add Trainer"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hire Date *</label>
                  <input
                    type="date"
                    name="hiredate"
                    value={form.hiredate}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g. Yoga, Weightlifting"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hourlyrate"
                    value={form.hourlyrate}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
                >
                  {editingTrainer ? "Update Trainer" : "Create Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;