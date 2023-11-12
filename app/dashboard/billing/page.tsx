import React from "react";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import BillingForm from "./_components/BillingForm";

export default async function BillingPage() {
	const subscriptionPlan = await getUserSubscriptionPlan();

	return <BillingForm subscriptionPlan={subscriptionPlan} />;
}
