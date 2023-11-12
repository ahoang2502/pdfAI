import React from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function UpgradeButton() {
	return (
		<Button className="w-full " >
			Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
		</Button>
	);
}
