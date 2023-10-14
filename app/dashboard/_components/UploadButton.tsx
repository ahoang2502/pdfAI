"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { useState } from "react";

const UploadButton = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(visible) => {
				if (!visible) {
					setIsOpen(visible);
				}
			}}
		>
			<DialogTrigger asChild onClick={() => setIsOpen(true)}>
				<Button className="bg-pink-600 hover:bg-pink-500 ">Upload PDF</Button>
			</DialogTrigger>

            <DialogContent>
                
            </DialogContent>
		</Dialog>
	);
};

export default UploadButton;
