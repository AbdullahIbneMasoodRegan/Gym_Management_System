import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const ManageMembers = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    joindate: "",
    dateofbirth: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [membersRes, branchesRes] = await Promise.all([
          supabase
            .from("members")
            .select("*"),
            //.order("joindate", { ascending: false }),
          supabase.from("branches").select("branchid, branchname"),
        ]);

        if (membersRes.error) throw membersRes.error;
        if (branchesRes.error) throw branchesRes.error;

        setMembers(membersRes.data || []);
        setBranches(branchesRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load members data.");
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
  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setForm({
        firstname: member.firstname || "",
        lastname: member.lastname || "",
        email: member.email || "",
        phone: member.phone || "",
        joindate: member.joindate || "",
        dateofbirth: member.dateofbirth || "",
        gender: member.gender || "",
        address: member.address || "",
      });
    } else {
      setEditingMember(null);
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        joindate: "",
        dateofbirth: "",
        gender: "",
        address: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      phone: form.phone || null,
      joindate: form.joindate,
      dateofbirth: form.dateofbirth || null,
      gender: form.gender || null,
      address: form.address || null,
    };

    try {
      let res;
      if (editingMember) {
        res = await supabase
          .from("members")
          .update(payload)
          .eq("memberid", editingMember.memberid);
      } else {
        res = await supabase.from("members").insert([payload]);
      }

      if (res.error) throw res.error;

      // Refresh list
      const { data, error } = await supabase
        .from("members")
        .select("*")
//.order("joindate", { ascending: false });
      if (error) throw error;

      setMembers(data || []);
      closeModal();
    } catch (err) {
      alert("Error saving member: " + err.message);
    }
  };

  const handleDelete = async (memberid) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this member? This will also delete related data (enrollments, payments, etc.)."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("memberid", memberid);
      if (error) throw error;

      setMembers((prev) => prev.filter((m) => m.memberid !== memberid));
    } catch (err) {
      alert("Error deleting member: " + err.message);
    }
  };

  // ---------- Helper display functions ----------
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return "—";
    return gender === "M" ? "Male" : gender === "F" ? "Female" : "Other";
  };

  // Summary stats
  const totalMembers = members.length;
  const activeJoinDate = new Date();
  const recentMembers = members.filter(
    (m) =>
      new Date(m.joindate) >
      new Date(activeJoinDate.getFullYear(), activeJoinDate.getMonth() - 1, 1)
  ).length;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Members</h1>

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
          Add Member
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalMembers}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">New This Month</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {recentMembers}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">All Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Join Date</th>
                <th className="border px-4 py-2 text-left">DOB</th>
                <th className="border px-4 py-2 text-left">Gender</th>
                <th className="border px-4 py-2 text-left">Address</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.memberid} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">
                      {member.memberid}
                    </td>
                    <td className="border px-4 py-2 font-medium">{`${member.firstname} ${member.lastname}`}</td>
                    <td className="border px-4 py-2">{member.email}</td>
                    <td className="border px-4 py-2">{member.phone || "—"}</td>
                    <td className="border px-4 py-2">
                      {formatDate(member.joindate)}
                    </td>
                    <td className="border px-4 py-2">
                      {formatDate(member.dateofbirth)}
                    </td>
                    <td className="border px-4 py-2">
                      {getGenderDisplay(member.gender)}
                    </td>
                    <td
                      className="border px-4 py-2 max-w-xs truncate"
                      title={member.address}
                    >
                      {member.address || "—"}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => openModal(member)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.memberid)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No members found
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
              {editingMember ? "Edit Member" : "Add New Member"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Join Date *
                  </label>
                  <input
                    type="date"
                    name="joindate"
                    value={form.joindate}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateofbirth"
                    value={form.dateofbirth}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border px-3 py-2 rounded resize-none"
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
                  {editingMember ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;
