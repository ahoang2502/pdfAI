import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
	const { getUser } = getKindeServerSession();
	const user = getUser();

	if (!user || !user.id) throw new Error("Unauthorized");

	const subscriptionPlan = await getUserSubscriptionPlan();

	return { userId: user.id, subscriptionPlan };
};

const onUploadComplete = async ({
	metadata,
	file,
}: {
	metadata: Awaited<ReturnType<typeof middleware>>;
	file: {
		key: string;
		name: string;
		url: string;
	};
}) => {
	const isFileExist = await db.file.findFirst({
		where: {
			key: file.key,
		},
	});

	if (isFileExist) return;

	const createdFile = await db.file.create({
		data: {
			key: file.key,
			name: file.name,
			userId: metadata.userId,
			url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
			uploadStatus: "PROCESSING",
		},
	});

	// Pinecone
	try {
		const response = await fetch(
			`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
		);
		const blob = await response.blob();

		// load pdf into memory
		const loader = new PDFLoader(blob);

		const pageLevelDocs = await loader.load();
		const pagesAmt = pageLevelDocs.length;

		const { subscriptionPlan } = metadata;
		const { isSubscribed } = subscriptionPlan;

		// Check if pdf file exceeded plan
		const isProExceeded =
			pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
		const isFreeExceeded =
			pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

		if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded))
			await db.file.update({
				data: { uploadStatus: "FAILED" },
				where: {
					id: createdFile.id,
				},
			});

		const combinedData = pageLevelDocs.map((document) => {
			return {
				...document,
				metadata: {
					fileId: createdFile.id,
				},
				dataset: "pdf",
			};
		});

		// vectorize and index entire document
		const pinecone = await getPineconeClient();
		const pineconeIndex = pinecone.Index("pdf-ai");

		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY,
		});

		await PineconeStore.fromDocuments(combinedData, embeddings, {
			pineconeIndex,
		});

		await db.file.update({
			data: { uploadStatus: "SUCCESS" },
			where: {
				id: createdFile.id,
			},
		});
	} catch (error) {
		console.log("[pdfUploader]", error);
		await db.file.update({
			data: { uploadStatus: "FAILED" },
			where: {
				id: createdFile.id,
			},
		});
	}
};

export const ourFileRouter = {
	freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
		.middleware(middleware)
		.onUploadComplete(onUploadComplete),
	proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
		.middleware(middleware)
		.onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
