import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AddStaff = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    hiredate: "",
    role: "",
    branchid: "",
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
      const { error } = await supabase.from("staff").insert([
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone || null,
          hiredate: formData.hiredate,
          role: formData.role,
          branchid: formData.branchid ? parseInt(formData.branchid) : null,
        },
      ]);

      if (error) throw error;
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Failed to add staff: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Staff</h1>
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
        <label className="block">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2"
        >
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Receptionist">Receptionist</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>
      <div>
        <label className="block">Branch ID</label>
        <input
          type="number"
          name="branchid"
          value={formData.branchid}
          onChange={handleChange}
          placeholder="Branch ID"
          className="w-full border px-3 py-2"
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-red px-4 py-2 text-white disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Staff"}
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

export default AddStaff;
