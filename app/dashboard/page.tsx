import Dashboard from "@/app/dashboard/_components/Dashboard";
import { db } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
	const { getUser } = getKindeServerSession();
	const user = getUser();

	if (!user || !user.id) return redirect("/auth-callback?origin=dashboard");

	const dbUser = await db.user.findFirst({
		where: {
			id: user.id,
		},
	});

	if (!dbUser) return redirect("/auth-callback?origin=dashboard");

	const subscriptionPlan = await getUserSubscriptionPlan();

	return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;
