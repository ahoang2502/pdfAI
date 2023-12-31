"use client";

import {
	ChevronDown,
	ChevronUp,
	Loader,
	Loader2,
	RotateCw,
	Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeDetector } from "react-resize-detector";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleBar from "simplebar-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import PdfFullScreen from "./PdfFullScreen";

interface PdfRendererProps {
	url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
	const [numPages, setNumPages] = useState<number>();
	const [currPage, setCurrPage] = useState<number>(1);
	const [scale, setScale] = useState<number>(1);
	const [rotation, setRotation] = useState<number>(0);
	const [renderedScale, setRenderedScale] = useState<number | null>(null);

	const isLoading = renderedScale !== scale;

	const { toast } = useToast();

	const customPageValidator = z.object({
		page: z
			.string()
			.refine((num) => Number(num) > 0 && Number(num) <= numPages!),
	});

	type TCustomPageValidator = z.infer<typeof customPageValidator>;
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<TCustomPageValidator>({
		defaultValues: {
			page: "1",
		},
		resolver: zodResolver(customPageValidator),
	});

	const { width, ref } = useResizeDetector();

	const handlePageSubmit = ({ page }: TCustomPageValidator) => {
		setCurrPage(Number(page));
		setValue("page", String(page));
	};

	return (
		<div className="w-full bg-white rounded-md shadow flex flex-col items-center">
			<div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
				<div className="flex items-center gap-1.5">
					<Button
						aria-label="previous page"
						variant="ghost"
						onClick={() => {
							setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
							setValue("page", String(currPage - 1));
						}}
						disabled={currPage <= 1}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>

					<div className="flex items-center gap-1.5 ">
						<Input
							{...register("page")}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSubmit(handlePageSubmit)();
								}
							}}
							className={cn(
								"w-12 h-8 ",
								errors.page && "focus-visible:ring-red-500"
							)}
						/>

						<p className="text-zinc-700 text-sm space-x-1 ">
							<span>/</span>
							<span>{numPages ?? "x"}</span>
						</p>
					</div>

					<Button
						aria-label="next page"
						variant="ghost"
						onClick={() => {
							setCurrPage((prev) =>
								prev + 1 > numPages! ? numPages! : prev + 1
							);
							setValue("page", String(currPage + 1));
						}}
						disabled={numPages === undefined || currPage === numPages}
					>
						<ChevronUp className="h-4 w-4" />
					</Button>
				</div>

				<div className="space-x-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button aria-label="zoom" variant="ghost" className="gap-1.5">
								<Search className="h-4 w-4" />
								{scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => setScale(1)}>
								100%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(1.5)}>
								150%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2)}>
								200%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2.5)}>
								250%
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						onClick={() => setRotation((prev) => prev + 90)}
						aria-label="rotate 90 degrees"
						variant="ghost"
					>
						<RotateCw className="h-4 w-4" />
					</Button>

					<PdfFullScreen fileUrl={url} />
				</div>
			</div>

			{/* pdf */}
			<div className="flex-1 w-full max-h-screen">
				<SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
					<div ref={ref} className="">
						<Document
							file={url}
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
							{isLoading && renderedScale ? (
								<Page
									width={width ? width : 1}
									pageNumber={currPage}
									scale={scale}
									rotate={rotation}
									key={"@" + renderedScale}
								/>
							) : null}

							<Page
								className={cn(isLoading ? "hidden" : "")}
								width={width ? width : 1}
								pageNumber={currPage}
								scale={scale}
								rotate={rotation}
								key={"@" + scale}
								loading={
									<div className="flex justify-center">
										<Loader className="my-24 h-6 w-6 animate-spin" />
									</div>
								}
								onRenderSuccess={() => setRenderedScale(scale)}
							/>
						</Document>
					</div>
				</SimpleBar>
			</div>
		</div>
	);
};

export default PdfRenderer;
