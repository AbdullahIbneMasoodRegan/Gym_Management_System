import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext"; // <-- your auth context

const inputStyles = `w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`;

function Form() {
  const { user, memberId } = useAuth(); // <-- get logged-in member ID

  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    classid: "",
    trainerid: "",
    rating: 5,
    comment: "",
  });

  const [status, setStatus] = useState(""); // idle | loading | success | error
  const [message, setMessage] = useState("");

  // Fetch classes & trainers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, trainerRes] = await Promise.all([
          supabase.from("classes").select("classid, classname"),
          supabase.from("trainers").select("trainerid, firstname, lastname"),
        ]);

        setClasses(classRes.data || []);
        setTrainers(trainerRes.data || []);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId) {
      setStatus("error");
      setMessage("You must be logged in to submit feedback.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = {
      memberid: memberId,
      classid: formData.classid ? parseInt(formData.classid) : null,
      trainerid: formData.trainerid ? parseInt(formData.trainerid) : null,
      rating: parseInt(formData.rating),
      comment: formData.comment || null,
      feedbackdate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };

    try {
      const { error } = await supabase.from("feedback").insert(payload);
      if (error) throw error;

      setStatus("success");
      setMessage("Thank you! Your feedback has been saved.");
      setFormData({ classid: "", trainerid: "", rating: 5, comment: "" });
    } catch (err) {
      setStatus("error");
      setMessage("Failed to submit. Please try again.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 px-6 py-8 rounded-lg shadow-sm">
      <h4 className="relative mb-6 pb-2 text-2xl font-bold capitalize after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-red">
        Leave Feedback
      </h4>

      <div className="space-y-5">
        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class <span className="text-red">*</span>
          </label>
          <select
            name="classid"
            value={formData.classid}
            onChange={handleChange}
            required
            className={inputStyles}
          >
            <option value="" disabled>
              Select a Class
            </option>
            {classes.map((cls) => (
              <option key={cls.classid} value={cls.classid}>
                {cls.classname}
              </option>
            ))}
          </select>
        </div>

        {/* Trainer (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trainer (Optional)
          </label>
          <select
            name="trainerid"
            value={formData.trainerid}
            onChange={handleChange}
            className={inputStyles}
          >
            <option value="">— No Trainer —</option>
            {trainers.map((t) => (
              <option key={t.trainerid} value={t.trainerid}>
                {t.firstname} {t.lastname}
              </option>
            ))}
          </select>
        </div>

        

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment (Optional)
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={4}
            placeholder="Share your experience..."
            className={`${inputStyles} resize-none`}
          />
        </div>

        {/* Status */}
        {status === "success" && (
          <p className="text-green-600 text-sm font-medium">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm font-medium">{message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full py-3 font-semibold uppercase text-white rounded-md transition ${
            status === "loading"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red hover:bg-red-700"
          }`}
        >
          {status === "loading" ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}

export default Form;