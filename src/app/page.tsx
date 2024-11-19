import MapApp from "@/src/components/map/MapApp";
import { authConfig } from "@/src/lib/auth/auth";
import db from "@/src/lib/db";
import { FolderStructureItem } from "@/src/lib/types/types";
import { defaultBinds } from "@/src/lib/values/initReduxValues";
import { getServerSession } from "next-auth";

interface pageProps {}

async function createUserIfNew(email: string) {
	const folderStructureDb = await db.users.getOne.folderStructure.email(email);
	if (!folderStructureDb) {
		await db.users.saveOne.fullObj.email(email, defaultBinds, [], [], []);
		return [];
	} else {
		return folderStructureDb;
	}
}

const page = async ({}: pageProps) => {
	let folderStructure: FolderStructureItem[] = [];
	const session = await getServerSession(authConfig);
	if (session?.user?.email) folderStructure = await createUserIfNew(session?.user?.email);

	return (
		<main className="flex w-screen h-screen overflow-hidden text-gray-300 bg-mainbg">
			<MapApp folderStructure={folderStructure} />
		</main>
	);
};

export default page;
