import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const ManagePayments = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState({
    memberid: "",
    amount: "",
    paymentdate: "",
    paymenttype: "Online",
    description: "",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [paymentsRes, membersRes] = await Promise.all([
          supabase.from("payments").select("*").order("paymentdate", { ascending: false }),
          supabase.from("members").select("memberid, firstname, lastname"),
        ]);

        setPayments(paymentsRes.data || []);
        setMembers(membersRes.data || []);
      } catch (err) {
        setError("Failed to load payments data.");
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
  const openModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setForm({
        memberid: payment.memberid?.toString() || "",
        amount: payment.amount?.toString() || "",
        paymentdate: payment.paymentdate || "",
        paymenttype: payment.paymenttype || "Online",
        description: payment.description || "",
      });
    } else {
      setEditingPayment(null);
      setForm({
        memberid: "",
        amount: "",
        paymentdate: "",
        paymenttype: "Online",
        description: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      memberid: parseInt(form.memberid),
      amount: parseFloat(form.amount),
      paymentdate: form.paymentdate,
      paymenttype: form.paymenttype,
      description: form.description || null,
    };

    try {
      let res;
      if (editingPayment) {
        res = await supabase
          .from("payments")
          .update(payload)
          .eq("paymentid", editingPayment.paymentid);
      } else {
        res = await supabase.from("payments").insert(payload);
      }

      if (res.error) throw res.error;

      // Refresh list
      const { data } = await supabase.from("payments").select("*");
      setPayments(data || []);
      closeModal();
    } catch (err) {
      alert("Error saving payment: " + err.message);
    }
  };

  const handleDelete = async (paymentid) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      const { error } = await supabase.from("payments").delete().eq("paymentid", paymentid);
      if (error) throw error;

      setPayments((prev) => prev.filter((p) => p.paymentid !== paymentid));
    } catch (err) {
      alert("Error deleting payment: " + err.message);
    }
  };

  // ---------- Helper display functions ----------
  const getMemberName = (id) => {
    const m = members.find((m) => m.memberid === id);
    return m ? `${m.firstname} ${m.lastname}` : "—";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  // Summary stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentCount = payments.length;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Payments</h1>

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
          Add Payment
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{paymentCount}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Avg. Payment</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {paymentCount > 0 ? formatCurrency(totalRevenue / paymentCount) : "$0.00"}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">All Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Member</th>
                <th className="border px-4 py-2 text-left">Amount</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.paymentid} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{payment.paymentid}</td>
                    <td className="border px-4 py-2">{getMemberName(payment.memberid)}</td>
                    <td className="border px-4 py-2 font-semibold text-green-700">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.paymenttype === "Online"
                            ? "bg-blue-100 text-blue-800"
                            : payment.paymenttype === "Card"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payment.paymenttype}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{formatDate(payment.paymentdate)}</td>
                    <td className="border px-4 py-2 max-w-xs truncate" title={payment.description}>
                      {payment.description || "—"}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => openModal(payment)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payment.paymentid)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No payments found
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPayment ? "Edit Payment" : "Add New Payment"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Member</label>
                  <select
                    name="memberid"
                    value={form.memberid}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Member</option>
                    {members.map((m) => (
                      <option key={m.memberid} value={m.memberid}>
                        {m.firstname} {m.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={form.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paymentdate"
                    value={form.paymentdate}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Type</label>
                  <select
                    name="paymenttype"
                    value={form.paymenttype}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="Online">Online</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows="2"
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
                  {editingPayment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;