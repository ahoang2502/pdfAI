import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
	// on client side
	if (typeof window !== "undefined") return path;

	// server side
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;

	return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
	title = "pdfAI - for students",
	description = "pdfAI is an open-source software that makes chatting with your PDF files easier.",
	image = "../public/thumbnail.png",
	icons = "../public/favicon.ico",
	noIndex = false,
}: {
	title?: string;
	description?: string;
	image?: string;
	icons?: string;
	noIndex?: boolean;
} = {}): Metadata {
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [{ url: image }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
			creator: "@fishta-oh",
		},
		icons,
		metadataBase: new URL(`https://fishta-pdfai.vercel.app`),
		themeColor: "#fff",
		...(noIndex && {
			robots: { index: false, follow: false },
		}),
	};
}
