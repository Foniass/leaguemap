import { Session } from "next-auth";
import { useEffect } from "react";
import axios from "axios";
import { UserDb } from "@/src/lib/db/users/collection";
import { useDispatch } from "react-redux";
import { setUserBinds } from "../redux/userSlice";

const useBinds = (session: Session | null) => {
	const dispatch = useDispatch();

	useEffect(() => {
		const updateUserBinds = async (email: string) => {
			const userData: UserDb = (await axios.get(`/api/mongodb/users/getUser?email=${email}`)).data;
			if (userData.binds) dispatch(setUserBinds(userData.binds));
		};
		if (session?.user?.email) updateUserBinds(session?.user?.email);
	}, [session?.user?.email, dispatch]);
};

export default useBinds;
