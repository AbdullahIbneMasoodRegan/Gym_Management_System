import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      const { data, error } = await supabase.from("trainers").select("*");
      if (!error) setTrainers(data);
      setLoading(false);
    };
    fetchTrainers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select Trainer to Update</h1>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t.trainerid}>
              <td className="border px-2 py-1">{t.firstname} {t.lastname}</td>
              <td className="border px-2 py-1">{t.email}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => navigate(`/edit-trainer/${t.trainerid}`)}
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

export default TrainerList;
