import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const StaffDashboard = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    hiredate: "",
    role: "",
    branchid: "",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [staffRes, branchesRes] = await Promise.all([
          supabase.from("staff").select("*").order("hiredate", { ascending: false }),
          supabase.from("branches").select("branchid, branchname"),
        ]);

        if (staffRes.error) throw staffRes.error;
        if (branchesRes.error) throw branchesRes.error;

        setStaff(staffRes.data || []);
        setBranches(branchesRes.data || []);
      } catch (err) {
        setError("Failed to load staff data.");
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

  const handleAddStaff = () => {
    navigate("/add-staff");
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  // ---------- Modal & Form ----------
  const openModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setForm({
        firstname: staffMember.firstname || "",
        lastname: staffMember.lastname || "",
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        hiredate: staffMember.hiredate || "",
        role: staffMember.role || "",
        branchid: staffMember.branchid?.toString() || "",
      });
    } else {
      setEditingStaff(null);
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        hiredate: "",
        role: "",
        branchid: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      phone: form.phone || null,
      hiredate: form.hiredate,
      role: form.role,
      branchid: form.branchid ? parseInt(form.branchid) : null,
    };

    try {
      let res;
      if (editingStaff) {
        res = await supabase
          .from("staff")
          .update(payload)
          .eq("staffid", editingStaff.staffid);
      } else {
        res = await supabase.from("staff").insert(payload);
      }

      if (res.error) throw res.error;

      // Refresh list
      const { data } = await supabase.from("staff").select("*");
      setStaff(data || []);
      closeModal();
    } catch (err) {
      alert("Error saving staff: " + err.message);
    }
  };

  const handleDelete = async (staffid) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const { error } = await supabase.from("staff").delete().eq("staffid", staffid);
      if (error) throw error;

      setStaff((prev) => prev.filter((s) => s.staffid !== staffid));
    } catch (err) {
      alert("Error deleting staff: " + err.message);
    }
  };

  // ---------- Helper display functions ----------
  const getBranchName = (id) => {
    const b = branches.find((b) => b.branchid === id);
    return b ? b.branchname : "—";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Members</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleBackToDashboard}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleAddStaff}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Add Staff
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Staff</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{staff.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Managers</h3>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {staff.filter(s => s.role === "Manager").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Receptionists</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {staff.filter(s => s.role === "Receptionist").length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Staff ID</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Hire Date</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-left">Branch</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length > 0 ? (
              staff.map((member) => (
                <tr key={member.staffid} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 font-medium">{member.staffid}</td>
                  <td className="border px-4 py-2 font-semibold">
                    {member.firstname} {member.lastname}
                  </td>
                  <td className="border px-4 py-2">{member.email}</td>
                  <td className="border px-4 py-2">{member.phone || "—"}</td>
                  <td className="border px-4 py-2">{formatDate(member.hiredate)}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "Manager"
                          ? "bg-purple-100 text-purple-800"
                          : member.role === "Receptionist"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{getBranchName(member.branchid)}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openModal(member)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.staffid)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No staff found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Edit Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hire Date *</label>
                  <input
                    type="date"
                    name="hiredate"
                    value={form.hiredate}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <select
                    name="branchid"
                    value={form.branchid}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— None —</option>
                    {branches.map((b) => (
                      <option key={b.branchid} value={b.branchid}>
                        {b.branchname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
                >
                  {editingStaff ? "Update Staff" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;