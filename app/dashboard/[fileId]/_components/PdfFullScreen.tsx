import { Expand, Loader2 } from "lucide-react";
import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page } from "react-pdf";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface PdfFullScreenProps {
	fileUrl: string;
}

export default function PdfFullScreen({ fileUrl }: PdfFullScreenProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [numPages, setNumPages] = useState<number>();
	const { toast } = useToast();

	const { width, ref } = useResizeDetector();

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(v) => {
				if (!v) {
					setIsOpen(v);
				}
			}}
		>
			<DialogTrigger asChild onClick={() => setIsOpen(true)}>
				<Button aria-label="fullscreen" variant="ghost" className="gap-1.5">
					<Expand className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-7xl w-full">
				<SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
					<div ref={ref} className="">
						<Document
							file={fileUrl}
							loading={
								<div className="flex justify-center">
									<Loader2 className="my-24 h-6 w-6 animate-spin" />
								</div>
							}
							onLoadError={() => {
								toast({
									title: "Error loading PDF",
									description: "Please try again later.",
									variant: "destructive",
								});
							}}
							onLoadSuccess={({ numPages }) => setNumPages(numPages)}
							className="max-h-full"
						>
							{new Array(numPages).fill(0).map((_, i) => (
								<Page key={i} width={width ? width : 1} pageNumber={i + 1} />
							))}
						</Document>
					</div>
				</SimpleBar>
			</DialogContent>
		</Dialog>
	);
}