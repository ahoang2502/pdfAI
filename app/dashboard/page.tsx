import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const DashboardPage = () => {
	const { getUser } = getKindeServerSession();
	const user = getUser();

	if (!user || !user.id) return redirect("/auth-callback?origin=dashboard");

	

	return <div>DashboardPage</div>;
};

export default DashboardPage;
