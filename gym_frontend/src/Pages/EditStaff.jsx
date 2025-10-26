import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const EditStaff = () => {
  const { staffid } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("staffid", staffid)
        .single();
      if (error) setError("Failed to load staff data");
      else setFormData(data);
      setLoading(false);
    };
    fetchStaff();
  }, [staffid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("staff")
      .update({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        hiredate: formData.hiredate,
        role: formData.role,
        branchid: formData.branchid ? parseInt(formData.branchid) : null,
      })
      .eq("staffid", staffid);

    if (error) setError("Update failed: " + error.message);
    else navigate("/staff-dashboard");
  };

  if (loading) return <div>Loading...</div>;
  if (!formData) return <div>{error}</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Staff Info</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Same labeled inputs as AddStaff.jsx, pre-filled with formData */}
        {/* Example: */}
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
        {/* Repeat for other fields... */}
        <div className="flex space-x-4">
          <button type="submit" className="bg-green-600 px-4 py-2 text-white">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate("/staff-dashboard")}
            className="bg-gray-500 px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;
