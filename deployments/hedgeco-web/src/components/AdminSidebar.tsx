import { Link } from "@tanstack/react-router";
import { type ReactNode, Suspense, useEffect } from "react";

export function AdminSidebar<T extends { id: number }>(props: {
	children: ReactNode;
	data: Array<T>;
	page: number;
	// navigate: UseNavigateResult<R>
	navigate: (props: {
		search: (prev: { page: number }) => { page: number };
		to?: string;
		params?: Record<string, string>;
	}) => void;
	currentIndex: number | null;
	idPath: string;
	idPathParamName: string;
	renderTarget: (target: T) => ReactNode;
	newPath?: string;
	newLabel?: string;
	pageSize: number;
}) {
	const currentIndex =
		props.currentIndex == null
			? null
			: props.data.findIndex(
					(target) => target.id === Number(props.currentIndex),
				);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const dir = event.key === "ArrowDown" ? 1 : -1;
				const isFirst = currentIndex === 0;
				const isLast = currentIndex === props.data.length - 1;
				if (isFirst && dir === -1) {
					if (props.page === 1) {
						return;
					}
					return props.navigate({
						search: (prev) => ({ page: prev.page - 1 }),
					});
				}
				if (isLast && dir === 1 && props.data.length % props.pageSize === 0) {
					return props.navigate({
						search: (prev) => ({ page: prev.page + 1 }),
					});
				}
				if (currentIndex == null) {
					const nextTarget =
						dir === 1 ? props.data[0] : props.data[props.data.length - 1];
					if (nextTarget == null) {
						return props.navigate({
							search: (prev) => ({ page: prev.page - 1 }),
						});
					}
					return props.navigate({
						to: props.idPath,
						params: { [props.idPathParamName]: nextTarget.id.toString() },
						search: (prev) => ({ page: prev.page }),
					});
				}

				const nextTargetId = props.data[currentIndex + dir]?.id.toString();
				if (nextTargetId != null) {
					return props.navigate({
						to: props.idPath,
						params: { [props.idPathParamName]: nextTargetId },
						search: (prev) => ({ page: prev.page }),
					});
				}
			}
			if (event.ctrlKey && event.key === "c" && props.newPath != null) {
				return props.navigate({
					to: props.newPath,
					search: (prev) => ({ page: prev.page }),
				});
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		currentIndex,
		props.navigate,
		props.data,
		props.page,
		props.idPath,
		props.idPathParamName,
		props.newPath,
		props.pageSize,
	]);

	return (
		<div className="flex h-full">
			<ul className="list-disc min-w-48 h-full flex flex-col">
				{props.newPath && (
					<Link
						to={props.newPath}
						className="border-b border-gray-700 h-14 flex items-center justify-center group"
					>
						<div className="text-lg group-hover:text-blue-800">
							{props.newLabel ?? "New"}
						</div>
					</Link>
				)}
				<Suspense fallback={<div>Loading...</div>}>
					{props.data.map((target) => {
						return (
							<li key={target.id} className="border-b border-gray-700 flex">
								<Link
									preload={false}
									to={props.idPath}
									params={{
										[props.idPathParamName]: target.id.toString(),
									}}
									search={{ page: props.page }}
									className="group block py-1 px-2 w-full border-l-4"
									inactiveProps={{
										className: "border-l-transparent",
									}}
									activeProps={{
										className: "text-black border-l-blue-800",
									}}
								>
									{props.renderTarget(target)}
								</Link>
							</li>
						);
					})}
				</Suspense>
				<div className="flex flex-grow" />
				<div className="flex justify-center items-center border-t border-gray-700">
					<Link
						disabled={props.page === 1}
						to={props.idPath}
						search={{ page: props.page - 1 }}
						params={{
							[props.idPathParamName]: props.currentIndex,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Previous
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						disabled={props.data.length % props.pageSize !== 0}
						to={props.currentIndex ? props.idPath : props.idPath}
						search={{ page: props.page + 1 }}
						params={{
							[props.idPathParamName]: props.currentIndex,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Next
					</Link>
				</div>
			</ul>
			<div className="w-[1px] bg-gray-700 h-full" />
			{props.children}
		</div>
	);
}
