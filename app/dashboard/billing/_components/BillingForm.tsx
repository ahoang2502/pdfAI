"use client";

import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BillingFormProps {
	subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

export default function BillingForm({ subscriptionPlan }: BillingFormProps) {
	const { toast } = useToast();

	const { mutate: createStripeSession, isLoading } =
		trpc.createStripeSession.useMutation({
			onSuccess: ({ url }) => {
				if (url) window.location.href = url;
				else
					return toast({
						title: "An error has happened...",
						description: "Please try again later.",
						variant: "destructive",
					});
			},
		});

	return (
		<MaxWidthWrapper className="max-w-5xl">
			<form
				className="mt-12 "
				onSubmit={(e) => {
					e.preventDefault();
					createStripeSession();
				}}
			>
				<Card>
					<CardHeader>
						<CardTitle>Subscription Plan</CardTitle>
						<CardDescription>
							You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
							plan.
						</CardDescription>
					</CardHeader>

					<CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
						<Button type="submit">
							{isLoading ? (
								<Loader2 className="h-4 w-4 mr-4 animate-spin" />
							) : null}
							{subscriptionPlan.isSubscribed
								? "Manage subscription"
								: "Upgrade to Pro"}
						</Button>

						{subscriptionPlan.isSubscribed ? (
							<p className="rounded-full text-xs font-medium">
								{subscriptionPlan.isCanceled
									? "Your plan will be canceled on "
									: "Your plan renews on "}
								{format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}.
							</p>
						) : null}
					</CardFooter>
				</Card>
			</form>
		</MaxWidthWrapper>
	);
}
