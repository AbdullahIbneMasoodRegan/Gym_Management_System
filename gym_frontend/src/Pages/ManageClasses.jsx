import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const ManageClasses = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({
    classname: "",
    trainerid: "",
    branchid: "",
    roomid: "",
    categoryid: "",
    schedule: "",
    capacity: "",
    duration: "",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [
          classesRes,
          trainersRes,
          branchesRes,
          roomsRes,
          categoriesRes,
        ] = await Promise.all([
          supabase.from("classes").select("*").order("schedule", { ascending: false }),
          supabase.from("trainers").select("trainerid, firstname, lastname"),
          supabase.from("branches").select("branchid, branchname"),
          supabase.from("rooms").select("roomid, roomname, branchid"),
          supabase.from("classcategories").select("categoryid, categoryname"),
        ]);

        setClasses(classesRes.data || []);
        setTrainers(trainersRes.data || []);
        setBranches(branchesRes.data || []);
        setRooms(roomsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError("Failed to load classes data.");
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

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  // ---------- Modal & Form ----------
  const openModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setForm({
        classname: cls.classname,
        trainerid: cls.trainerid?.toString() || "",
        branchid: cls.branchid?.toString() || "",
        roomid: cls.roomid?.toString() || "",
        categoryid: cls.categoryid?.toString() || "",
        schedule: cls.schedule ? cls.schedule.slice(0, 16) : "",
        capacity: cls.capacity?.toString() || "",
        duration: cls.duration?.toString() || "",
      });
    } else {
      setEditingClass(null);
      setForm({
        classname: "",
        trainerid: "",
        branchid: "",
        roomid: "",
        categoryid: "",
        schedule: "",
        capacity: "",
        duration: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      classname: form.classname,
      trainerid: form.trainerid ? parseInt(form.trainerid) : null,
      branchid: form.branchid ? parseInt(form.branchid) : null,
      roomid: form.roomid ? parseInt(form.roomid) : null,
      categoryid: form.categoryid ? parseInt(form.categoryid) : null,
      schedule: form.schedule,
      capacity: parseInt(form.capacity),
      duration: parseInt(form.duration),
    };

    try {
      let res;
      if (editingClass) {
        res = await supabase
          .from("classes")
          .update(payload)
          .eq("classid", editingClass.classid);
      } else {
        res = await supabase.from("classes").insert(payload);
      }

      if (res.error) throw res.error;

      // Refresh list
      const { data } = await supabase.from("classes").select("*");
      setClasses(data || []);
      closeModal();
    } catch (err) {
      alert("Error saving class: " + err.message);
    }
  };

  const handleDelete = async (classid) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      const { error } = await supabase.from("classes").delete().eq("classid", classid);
      if (error) throw error;

      setClasses((prev) => prev.filter((c) => c.classid !== classid));
    } catch (err) {
      alert("Error deleting class: " + err.message);
    }
  };

  // ---------- Helper display functions ----------
  const getTrainerName = (id) => {
    const t = trainers.find((t) => t.trainerid === id);
    return t ? `${t.firstname} ${t.lastname}` : "—";
  };

  const getBranchName = (id) => {
    const b = branches.find((b) => b.branchid === id);
    return b ? b.branchname : "—";
  };

  const getRoomName = (id) => {
    const r = rooms.find((r) => r.roomid === id);
    return r ? r.roomname : "—";
  };

  const getCategoryName = (id) => {
    const c = categories.find((c) => c.categoryid === id);
    return c ? c.categoryname : "—";
  };

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Classes</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleBack}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => openModal()}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Add New Class
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">All Classes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Class Name</th>
                <th className="border px-4 py-2 text-left">Trainer</th>
                <th className="border px-4 py-2 text-left">Branch</th>
                <th className="border px-4 py-2 text-left">Room</th>
                <th className="border px-4 py-2 text-left">Category</th>
                <th className="border px-4 py-2 text-left">Schedule</th>
                <th className="border px-4 py-2 text-left">Capacity</th>
                <th className="border px-4 py-2 text-left">Duration (min)</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <tr key={cls.classid} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{cls.classid}</td>
                    <td className="border px-4 py-2">{cls.classname}</td>
                    <td className="border px-4 py-2">{getTrainerName(cls.trainerid)}</td>
                    <td className="border px-4 py-2">{getBranchName(cls.branchid)}</td>
                    <td className="border px-4 py-2">{getRoomName(cls.roomid)}</td>
                    <td className="border px-4 py-2">{getCategoryName(cls.categoryid)}</td>
                    <td className="border px-4 py-2">{formatDateTime(cls.schedule)}</td>
                    <td className="border px-4 py-2">{cls.capacity}</td>
                    <td className="border px-4 py-2">{cls.duration}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => openModal(cls)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls.classid)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingClass ? "Edit Class" : "Add New Class"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class Name</label>
                  <input
                    type="text"
                    name="classname"
                    value={form.classname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Trainer</label>
                  <select
                    name="trainerid"
                    value={form.trainerid}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">— None —</option>
                    {trainers.map((t) => (
                      <option key={t.trainerid} value={t.trainerid}>
                        {t.firstname} {t.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <select
                    name="branchid"
                    value={form.branchid}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.branchid} value={b.branchid}>
                        {b.branchname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Room</label>
                  <select
                    name="roomid"
                    value={form.roomid}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">— None —</option>
                    {rooms
                      .filter((r) => !form.branchid || r.branchid === parseInt(form.branchid))
                      .map((r) => (
                        <option key={r.roomid} value={r.roomid}>
                          {r.roomname}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="categoryid"
                    value={form.categoryid}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryid} value={c.categoryid}>
                        {c.categoryname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Schedule</label>
                  <input
                    type="datetime-local"
                    name="schedule"
                    value={form.schedule}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
                >
                  {editingClass ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;