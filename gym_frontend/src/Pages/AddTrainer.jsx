import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AddTrainer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    hiredate: "",
    specialization: "",
    hourlyrate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("trainers").insert([
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone || null,
          hiredate: formData.hiredate,
          specialization: formData.specialization || null,
          hourlyrate: formData.hourlyrate ? parseFloat(formData.hourlyrate) : null,
        },
      ]);

      if (error) throw error;
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Failed to add trainer: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Trainer</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">First Name</label>
        <input
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block">Last Name</label>
        <input
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block">Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block">Hire Date</label>
        <input
          type="date"
          name="hiredate"
          id="hiredate"
          value={formData.hiredate}
          onChange={handleChange}
          required
          max={new Date().toISOString().split("T")[0]}
          className="w-full border px-3 py-2 mt-1"
        />
      </div>
      <div>
        <label className="block">Specialization</label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block">Hourly Rate</label>
        <input
          type="number"
          name="hourlyrate"
          step="0.50"
          min="0"
          value={formData.hourlyrate}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-red px-4 py-2 text-white disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Trainer"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin-dashboard")}
          className="bg-gray-500 px-4 py-2 text-white"
        >
          Cancel
        </button>
      </div>
    </form>

    </div>
  );
};

export default AddTrainer;
