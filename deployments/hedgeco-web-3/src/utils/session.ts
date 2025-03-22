// src/services/session.server.ts
import { useSession } from "@tanstack/react-start/server";

//todo-auth - add user type
type User = {
	email: string;
};

type SessionUser = {
	userEmail: User["email"];
};

export function useAppSession() {
	return useSession<SessionUser>({
		password: "ChangeThisBeforeShippingToProdOrYouWillBeFired",
	});
}
