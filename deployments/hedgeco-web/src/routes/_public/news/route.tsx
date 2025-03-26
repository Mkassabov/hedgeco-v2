import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/news")({
	component: NewsComponent,
});

function NewsComponent() {
	return (
		<>
			<h1 className="text-cyan-900 text-2xl font-bold mt-5">
				Alternative Investment News
			</h1>
			<hr />
			<div className="flex flex-col gap-4 mt-2">
				<Outlet />
			</div>
		</>
	);
}
