import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalStaff: 0,
    totalTrainers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    equipmentUnderMaintenance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) {
      navigate("/admin-login");
      return;
    }

    const fetchStats = async () => {
      try {
        const [
          membersRes,
          staffRes,
          trainersRes,
          classesRes,
          paymentsRes,      // <-- fetch the whole row to get amount
          inventoryRes,
          equipmentRes,
        ] = await Promise.all([
          supabase.from("members").select("memberid", { count: "exact" }),
          supabase.from("staff").select("staffid", { count: "exact" }),
          supabase.from("trainers").select("trainerid", { count: "exact" }),
          supabase.from("classes").select("classid", { count: "exact" }),
          supabase.from("payments").select("amount"), // <-- no head:true
          supabase.from("inventory").select("quantity"),
          supabase.from("equipment").select("status"),
        ]);

        const totalRevenue =
          paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        const lowStock =
          inventoryRes.data?.filter(i => i.quantity < 10).length || 0;

        const underMaintenance =
          equipmentRes.data?.filter(e => e.status === "Under Maintenance").length || 0;

        setStats({
          totalMembers: membersRes.count || 0,
          totalStaff: staffRes.count || 0,
          totalTrainers: trainersRes.count || 0,
          totalClasses: classesRes.count || 0,
          totalRevenue,
          lowStockItems: lowStock,
          equipmentUnderMaintenance: underMaintenance,
        });
      } catch (err) {
        setError("Failed to load dashboard stats.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin-login");
  };

  

  // Navigation shortcuts
  const nav = {
    members: () => navigate("/manage-members"),
    staff: () => navigate("/staff-dashboard"),
    trainers: () => navigate("/trainer-dashboard"),
    classes: () => navigate("/manage-classes"),
    payments: () => navigate("/manage-payments"),
    inventory: () => navigate("/manage-inventory-equipment"),
    feedbacks: () => navigate("/feedbacks"),
    addMember: () => navigate("/add-member"),
  };

  const formatCurrency = amount =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>

      {/* Quick Actions – all same red style */}
      <div className="flex flex-wrap gap-3 mb-8">
        
        <button onClick={nav.members} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Members
        </button>
        <button onClick={nav.staff} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Staff
        </button>
        <button onClick={nav.trainers} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Trainers
        </button>
        <button onClick={nav.classes} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Classes
        </button>
        <button onClick={nav.payments} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Payments
        </button>
        <button onClick={nav.inventory} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          Manage Inventory
        </button>
        <button onClick={nav.feedbacks} className="bg-red hover:bg-red-700 text-white px-4 py-2 rounded">
          View Feedbacks
        </button>
      </div>

      {/* Summary Stats Grid – no pending-feedback card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Members" value={stats.totalMembers} color="blue" onClick={nav.members} />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="green"
          onClick={nav.payments}
        />
        <StatCard title="Active Classes" value={stats.totalClasses} color="teal" onClick={nav.classes} />
        <StatCard title="Staff Count" value={stats.totalStaff} color="purple" onClick={nav.staff} />
        <StatCard title="Trainers" value={stats.totalTrainers} color="indigo" onClick={nav.trainers} />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          color="orange"
          onClick={nav.inventory}
          badge={stats.lowStockItems > 0}
        />
        <StatCard
          title="Under Maintenance"
          value={stats.equipmentUnderMaintenance}
          color="red"
          onClick={nav.inventory}
          badge={stats.equipmentUnderMaintenance > 0}
        />
      </div>
    </div>
  );
};

/* Re-usable Stat Card */
const StatCard = ({ title, value, color, onClick, badge = false }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        {badge && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className={`mt-3 text-xs font-medium ${colorMap[color]} px-2 py-1 rounded-full inline-block`}>
        View Details
      </div>
    </div>
  );
};

export default AdminDashboard;