import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import DashboardView from "../../components/dashboard/DashboardView";

const Dashboard = () => {
  return (
    <AdminLayout title="Inicio">
      <DashboardView />
    </AdminLayout>
  );
};

export default Dashboard;