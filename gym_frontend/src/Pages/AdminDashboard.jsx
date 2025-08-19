import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const { role, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [membersData, inventoryData, equipmentsData] = await Promise.all([
          supabase.from("members").select("*"),
          supabase.from("inventory").select("*"),
          supabase.from("equipment").select("*"),
        ]);
        setMembers(membersData.data || []);
        setInventory(inventoryData.data || []);
        setEquipments(equipmentsData.data || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
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

  const handleAddMember = () => {
  navigate("/add-member");
};

  const handleManageStuff = () => {
  navigate("/add-member");
};

const handleManageTrainers = () => {
  navigate("/add-member");
};



  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
      
      <div className="flex gap-2">
  <button
    onClick={handleAddMember}
    className="bg-red px-4 py-2 text-white rounded"
  >
    Add Member
  </button>
  <button
    onClick={handleManageStuff}
    className="bg-red px-4 py-2 text-white rounded"
  >
    Manage Staff
  </button>
  <button
    onClick={handleManageTrainers}
    className="bg-red px-4 py-2 text-white rounded"
  >
    Manage Trainers
  </button>
  <button
    onClick={handleLogout}
    className="bg-red px-4 py-2 text-white rounded"
  >
    Logout
  </button>
</div>



      <section className="mt-6">
  <h2 className="text-xl font-semibold">Members</h2>
  <div className="overflow-x-auto">
    <table className="w-full mt-2 border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Name</th>
          <th className="border px-2 py-1">Email</th>
          <th className="border px-2 py-1">Phone</th>
          <th className="border px-2 py-1">Join Date</th>
          <th className="border px-2 py-1">Date of Birth</th>
          <th className="border px-2 py-1">Gender</th>
          <th className="border px-2 py-1">Address</th>
        </tr>
      </thead>
      <tbody>
        {members.length > 0 ? (
          members.map((member) => (
            <tr key={member.memberid} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{member.memberid}</td>
              <td className="border px-2 py-1">{`${member.firstname} ${member.lastname}`}</td>
              <td className="border px-2 py-1">{member.email}</td>
              <td className="border px-2 py-1">{member.phone || "—"}</td>
              <td className="border px-2 py-1">{member.joindate}</td>
              <td className="border px-2 py-1">{member.dateofbirth || "—"}</td>
              <td className="border px-2 py-1">
                {member.gender === "M"
                  ? "Male"
                  : member.gender === "F"
                  ? "Female"
                  : "Other"}
              </td>
              <td className="border px-2 py-1">{member.address || "—"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center py-2">No members found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>


      <section className="mt-6">
  <h2 className="text-xl font-semibold">Inventory</h2>
  <div className="overflow-x-auto">
    <table className="w-full mt-2 border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">Inventory ID</th>
          <th className="border px-2 py-1">Branch ID</th>
          <th className="border px-2 py-1">Item Name</th>
          <th className="border px-2 py-1">Quantity</th>
          <th className="border px-2 py-1">Last Restocked</th>
        </tr>
      </thead>
      <tbody>
        {inventory.length > 0 ? (
          inventory.map((item) => (
            <tr key={item.inventoryid} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{item.inventoryid}</td>
              <td className="border px-2 py-1">{item.branchid}</td>
              <td className="border px-2 py-1">{item.itemname}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
              <td className="border px-2 py-1">{item.lastrestocked || "—"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-2">No inventory items found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>


      <section className="mt-6">
  <h2 className="text-xl font-semibold">Equipments</h2>
  <div className="overflow-x-auto">
    <table className="w-full mt-2 border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">Equipment ID</th>
          <th className="border px-2 py-1">Equipment Name</th>
          <th className="border px-2 py-1">Branch ID</th>
          <th className="border px-2 py-1">Purchase Date</th>
          <th className="border px-2 py-1">Maintenance Date</th>
          <th className="border px-2 py-1">Status</th>
        </tr>
      </thead>
      <tbody>
        {equipments.length > 0 ? (
          equipments.map((eq) => (
            <tr key={eq.equipmentid} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{eq.equipmentid}</td>
              <td className="border px-2 py-1">{eq.equipmentname}</td>
              <td className="border px-2 py-1">{eq.branchid}</td>
              <td className="border px-2 py-1">{eq.purchasedate || "—"}</td>
              <td className="border px-2 py-1">{eq.maintenancedate || "—"}</td>
              <td className="border px-2 py-1">{eq.status}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-2">No equipment found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>


      {role === "admin" && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Add Staff/Trainer</h2>
          {/* Placeholder form - To be expanded */}
          <p>Add Staff/Trainer form coming soon...</p>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;