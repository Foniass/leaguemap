import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const useUrlFct = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const editUrl = useCallback(
		(changes: { key: string; value: string }[]) => {
			const params = new URLSearchParams(searchParams);
			changes.forEach(({ key, value }) => {
				if (searchParams.get(key) === value) return;
				if (value === "") params.delete(key);
				else params.set(key, value);
			});
			if (searchParams.toString() !== params.toString()) router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams]
	);
	return { editUrl };
};

export default useUrlFct;
