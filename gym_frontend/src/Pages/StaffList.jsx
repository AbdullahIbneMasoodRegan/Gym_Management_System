import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase.from("staff").select("*");
      if (!error) setStaff(data);
      setLoading(false);
    };
    fetchStaff();
  }, []);
  console.log("Staff data:", staff);
  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select Staff to Update</h1>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.staffid}>
              <td className="border px-2 py-1">{s.firstname} {s.lastname}</td>
              <td className="border px-2 py-1">{s.email}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => navigate(`/edit-staff/${s.staffid}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;
