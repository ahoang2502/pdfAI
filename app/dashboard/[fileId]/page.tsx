import ChatWrapper from "./_components/ChatWrapper";
import PdfRenderer from "./_components/PdfRenderer";
import { db } from "@/lib/db";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

const FileIdPage = async ({ params }: { params: { fileId: string } }) => {
	const { fileId } = params;

	const { getUser } = getKindeServerSession();
	const user = getUser();

	if (!user || !user.id)
		return redirect(`/auth-callback?origin=dashboard/${fileId}`);

	const file = await db.file.findFirst({
		where: {
			id: fileId,
			userId: user.id,
		},
	});

	if (!file) return notFound();

	return (
		<div className="flex-1 justify-between flex flex-col h-[calc(100vh - 3.5rem)] ">
			<div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2 ">
				{/* Left side */}
				<div className="flex-1 xl:flex">
					<div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
						<PdfRenderer />
					</div>
				</div>

				{/* Right side */}
				<div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
					<ChatWrapper />
				</div>
			</div>
		</div>
	);
};

export default FileIdPage;
