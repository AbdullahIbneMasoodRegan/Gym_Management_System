import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const Feedbacks = () => {
  const { role, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [feedbacksData, membersData, classesData, trainersData] = await Promise.all([
          supabase.from("feedback").select("*").order("feedbackdate", { ascending: false }),
          supabase.from("members").select("memberid, firstname, lastname"),
          supabase.from("classes").select("classid, classname"),
          supabase.from("trainers").select("trainerid, firstname, lastname"),
        ]);

        setFeedbacks(feedbacksData.data || []);
        setMembers(membersData.data || []);
        setClasses(classesData.data || []);
        setTrainers(trainersData.data || []);
      } catch (err) {
        setError("Failed to load feedback data.");
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

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  // Helper functions to get display names
  const getMemberName = (memberId) => {
    const member = members.find(m => m.memberid === memberId);
    return member ? `${member.firstname} ${member.lastname}` : "—";
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.classid === classId);
    return cls ? cls.classname : "—";
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.trainerid === trainerId);
    return trainer ? `${trainer.firstname} ${trainer.lastname}` : "—";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feedbacks</h1>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleBackToDashboard}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-dark"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-dark"
        >
          Logout
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-4">All Feedbacks</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Feedback ID</th>
                <th className="border px-4 py-2 text-left">Member</th>
                <th className="border px-4 py-2 text-left">Class</th>
                <th className="border px-4 py-2 text-left">Trainer</th>
                <th className="border px-4 py-2 text-left">Rating</th>
                <th className="border px-4 py-2 text-left">Comment</th>
                <th className="border px-4 py-2 text-left">Feedback Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                  <tr key={feedback.feedbackid} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{feedback.feedbackid}</td>
                    <td className="border px-4 py-2">{getMemberName(feedback.memberid)}</td>
                    <td className="border px-4 py-2">{getClassName(feedback.classid)}</td>
                    <td className="border px-4 py-2">{getTrainerName(feedback.trainerid)}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        feedback.rating >= 4 ? 'bg-green-100 text-green-800' :
                        feedback.rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.rating}/5
                      </span>
                    </td>
                    <td className="border px-4 py-2 max-w-xs truncate" title={feedback.comment}>
                      {feedback.comment || "—"}
                    </td>
                    <td className="border px-4 py-2">{feedback.feedbackdate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No feedbacks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Feedbacks</h3>
          <p className="text-3xl font-bold text-blue-600">{feedbacks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600">
            {feedbacks.length > 0 
              ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
              : '0.0'}
            /5
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Feedbacks</h3>
          <p className="text-3xl font-bold text-purple-600">{feedbacks.length}</p>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </section>
    </div>
  );
};

export default Feedbacks;