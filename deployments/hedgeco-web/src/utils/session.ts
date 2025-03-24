// src/services/session.server.ts
import type { Subject as AdminSubject } from "@hedgeco/admin-auth";
import type { Subject as UserSubject } from "@hedgeco/user-auth";
import { useSession } from "@tanstack/react-start/server";

export function useAppSession() {
	return useSession<{ adminSubject: AdminSubject; userSubject: UserSubject }>({
		password: "c0cxjSKtPnPnTDKu-KrOLBmf_GcBUZvx76Nq", //todo check if this is public?
	});
}
