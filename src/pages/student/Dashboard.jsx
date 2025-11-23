import StudentLayout from "../../modules/student/layouts/StudentLayout";
import ProfileView from "../../components/ui/ProfileView";

const Dashboard = () => {
  return (
    <StudentLayout title="Mi perfil de estudiante">
      <ProfileView showBackButton={false} />
    </StudentLayout>
  );
};

export default Dashboard;