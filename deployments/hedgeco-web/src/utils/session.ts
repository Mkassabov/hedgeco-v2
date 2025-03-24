// src/services/session.server.ts
import type { Subject } from "@hedgeco/admin-auth";
import { useSession } from "@tanstack/react-start/server";

export function useAppSession() {
	return useSession<{ subject: Subject }>({
		password: "c0cxjSKtPnPnTDKu-KrOLBmf_GcBUZvx76Nq", //todo check if this is public?
	});
}
