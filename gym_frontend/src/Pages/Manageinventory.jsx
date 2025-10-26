import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const ManageInventoryEquipment = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "equipment"
  const [inventory, setInventory] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemType, setItemType] = useState(""); // "inventory" or "equipment"
  const [form, setForm] = useState({
    // Inventory
    branchid: "",
    itemname: "",
    quantity: "",
    lastrestocked: "",

    // Equipment
    equipmentname: "",
    branchid_eq: "",
    purchasedate: "",
    maintenancedate: "",
    status: "Operational",
  });

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [invRes, eqRes, branchesRes] = await Promise.all([
          supabase.from("inventory").select("*").order("lastrestocked", { ascending: false }),
          supabase.from("equipment").select("*").order("purchasedate", { ascending: false }),
          supabase.from("branches").select("branchid, branchname"),
        ]);

        setInventory(invRes.data || []);
        setEquipment(eqRes.data || []);
        setBranches(branchesRes.data || []);
      } catch (err) {
        setError("Failed to load data.");
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
  const openModal = (type, item = null) => {
    setItemType(type);
    setEditingItem(item);

    if (type === "inventory") {
      setForm({
        branchid: item?.branchid?.toString() || "",
        itemname: item?.itemname || "",
        quantity: item?.quantity?.toString() || "",
        lastrestocked: item?.lastrestocked || "",
      });
    } else {
      setForm({
        equipmentname: item?.equipmentname || "",
        branchid_eq: item?.branchid?.toString() || "",
        purchasedate: item?.purchasedate || "",
        maintenancedate: item?.maintenancedate || "",
        status: item?.status || "Operational",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setItemType("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (itemType === "inventory") {
        const payload = {
          branchid: parseInt(form.branchid),
          itemname: form.itemname,
          quantity: parseInt(form.quantity),
          lastrestocked: form.lastrestocked || null,
        };

        if (editingItem) {
          res = await supabase
            .from("inventory")
            .update(payload)
            .eq("inventoryid", editingItem.inventoryid);
        } else {
          res = await supabase.from("inventory").insert(payload);
        }
      } else {
        const payload = {
          equipmentname: form.equipmentname,
          branchid: parseInt(form.branchid_eq),
          purchasedate: form.purchasedate || null,
          maintenancedate: form.maintenancedate || null,
          status: form.status,
        };

        if (editingItem) {
          res = await supabase
            .from("equipment")
            .update(payload)
            .eq("equipmentid", editingItem.equipmentid);
        } else {
          res = await supabase.from("equipment").insert(payload);
        }
      }

      if (res.error) throw res.error;

      // Refresh
      const inv = await supabase.from("inventory").select("*");
      const eq = await supabase.from("equipment").select("*");
      setInventory(inv.data || []);
      setEquipment(eq.data || []);
      closeModal();
    } catch (err) {
      alert("Error saving item: " + err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const table = type === "inventory" ? "inventory" : "equipment";
      const key = type === "inventory" ? "inventoryid" : "equipmentid";
      const { error } = await supabase.from(table).delete().eq(key, id);
      if (error) throw error;

      if (type === "inventory") {
        setInventory((prev) => prev.filter((i) => i.inventoryid !== id));
      } else {
        setEquipment((prev) => prev.filter((e) => e.equipmentid !== id));
      }
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  // ---------- Helpers ----------
  const getBranchName = (id) => {
    const b = branches.find((b) => b.branchid === id);
    return b ? b.branchname : "—";
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  // Summary
  const lowStockCount = inventory.filter((i) => i.quantity < 10).length;
  const underMaintenance = equipment.filter((e) => e.status === "Under Maintenance").length;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Inventory & Equipment</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleBack}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => openModal(activeTab)}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Add {activeTab === "inventory" ? "Inventory" : "Equipment"}
        </button>
        <button
          onClick={handleLogout}
          className="bg-red px-4 py-2 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-2 font-medium rounded-t-lg transition ${
              activeTab === "inventory"
                ? "bg-white border border-b-0 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("equipment")}
            className={`px-6 py-2 font-medium rounded-t-lg transition ${
              activeTab === "equipment"
                ? "bg-white border border-b-0 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Equipment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Inventory Items</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inventory.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Low Stock (&lt;10)</h3>
          <p className="text-2xl font-bold text-orange-600 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Equipment</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{equipment.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Under Maintenance</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{underMaintenance}</p>
        </div>
      </div>

      {/* Content */}
      {activeTab === "inventory" ? (
        <section>
          <h2 className="text-xl font-semibold mb-3">Inventory Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Item Name</th>
                  <th className="border px-4 py-2 text-left">Branch</th>
                  <th className="border px-4 py-2 text-left">Quantity</th>
                  <th className="border px-4 py-2 text-left">Last Restocked</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length > 0 ? (
                  inventory.map((item) => (
                    <tr key={item.inventoryid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-medium">{item.inventoryid}</td>
                      <td className="border px-4 py-2">{item.itemname}</td>
                      <td className="border px-4 py-2">{getBranchName(item.branchid)}</td>
                      <td className="border px-4 py-2">
                        <span
                          className={`font-semibold ${
                            item.quantity < 10 ? "text-red-600" : "text-green-700"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="border px-4 py-2">{formatDate(item.lastrestocked)}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => openModal("inventory", item)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("inventory", item.inventoryid)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No inventory items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-3">Equipment</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Branch</th>
                  <th className="border px-4 py-2 text-left">Purchase Date</th>
                  <th className="border px-4 py-2 text-left">Maintenance</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length > 0 ? (
                  equipment.map((eq) => (
                    <tr key={eq.equipmentid} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-medium">{eq.equipmentid}</td>
                      <td className="border px-4 py-2">{eq.equipmentname}</td>
                      <td className="border px-4 py-2">{getBranchName(eq.branchid)}</td>
                      <td className="border px-4 py-2">{formatDate(eq.purchasedate)}</td>
                      <td className="border px-4 py-2">{formatDate(eq.maintenancedate)}</td>
                      <td className="border px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            eq.status === "Operational"
                              ? "bg-green-100 text-green-800"
                              : eq.status === "Under Maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {eq.status}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => openModal("equipment", eq)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("equipment", eq.equipmentid)}
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
                      No equipment found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem
                ? `Edit ${itemType === "inventory" ? "Inventory" : "Equipment"}`
                : `Add ${itemType === "inventory" ? "Inventory" : "Equipment"}`}
            </h2>
            <form onSubmit={handleSubmit}>
              {itemType === "inventory" ? (
                <>
                  <div className="mb-4">
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      name="itemname"
                      value={form.itemname}
                      onChange={handleInputChange}
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Last Restocked</label>
                    <input
                      type="date"
                      name="lastrestocked"
                      value={form.lastrestocked}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Equipment Name</label>
                    <input
                      type="text"
                      name="equipmentname"
                      value={form.equipmentname}
                      onChange={handleInputChange}
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <select
                      name="branchid_eq"
                      value={form.branchid_eq}
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Purchase Date</label>
                    <input
                      type="date"
                      name="purchasedate"
                      value={form.purchasedate}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Last Maintenance</label>
                    <input
                      type="date"
                      name="maintenancedate"
                      value={form.maintenancedate}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>
                </>
              )}

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
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInventoryEquipment;