import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import DashboardView from "../../components/dashboard/DashboardView";

const Dashboard = () => {
  return (
    <ProfessorLayout title="Inicio Docente">
      <DashboardView />
    </ProfessorLayout>
  );
};

export default Dashboard;
