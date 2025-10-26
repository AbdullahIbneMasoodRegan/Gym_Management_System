import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const EditTrainer = () => {
  const { trainerid } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .eq("trainerid", trainerid)
        .single();
      if (error) setError("Failed to load trainer data");
      else setFormData(data);
      setLoading(false);
    };
    fetchTrainer();
  }, [trainerid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("trainers")
      .update({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        hiredate: formData.hiredate,
        specialization: formData.specialization,
        hourlyrate: formData.hourlyrate ? parseFloat(formData.hourlyrate) : null,
      })
      .eq("trainerid", trainerid);

    if (error) setError("Update failed: " + error.message);
    else navigate("/trainer-dashboard");
  };

  if (loading) return <div>Loading...</div>;
  if (!formData) return <div>{error}</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Trainer Info</h1>
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
            value={formData.hiredate}
            onChange={handleChange}
            required
            max={new Date().toISOString().split("T")[0]}
            className="w-full border px-3 py-2"
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
            step="1"
            min="0"
            value={formData.hourlyrate}
            onChange={handleChange}
            className="w-full border px-3 py-2"
          />
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="bg-green-600 px-4 py-2 text-white">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate("/trainer-dashboard")}
            className="bg-gray-500 px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrainer;
