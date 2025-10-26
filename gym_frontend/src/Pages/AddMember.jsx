import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AddMember = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    joindate: "",
    dateofbirth: "",
    gender: "",
    address: "",
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
      const { error } = await supabase.from("members").insert([
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone || null,
          joindate: formData.joindate,
          dateofbirth: formData.dateofbirth || null,
          gender: formData.gender || null,
          address: formData.address || null,
        },
      ]);

      if (error) throw error;
      navigate("/admin-dashboard"); // Redirect back to dashboard on success
    } catch (err) {
      setError("Failed to add member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Member</h1>
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
          <label className="block">Join Date</label>
          <input
            type="date"
            name="joindate"
            value={formData.joindate}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block">Date of Birth</label>
          <input
            type="date"
            name="dateofbirth"
            value={formData.dateofbirth}
            onChange={handleChange}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2"
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        <div>
          <label className="block">Address</label>
          <textarea
            name="address"
            value={formData.address}
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
            {loading ? "Adding..." : "Add Member"}
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

export default AddMember;