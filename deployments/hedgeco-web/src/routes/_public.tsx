import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	// const login = useServerFn(loginFn);
	const login = () => {};

	return (
		<>
			<header className="relative h-[178px]">
				<div className="text-white bg-black px-20 py-1 flex justify-between items-center gap-4 text-sm">
					<span className="ml-24">
						Register free as a{" "}
						<Link className="underline font-semibold" to="/register/hedge-fund">
							Hedge Fund
						</Link>
						,{" "}
						<Link className="underline font-semibold" to="/register/investor">
							Investor
						</Link>
						,{" "}
						<Link
							className="underline font-semibold"
							to="/register/service-provider"
						>
							Service Provider
						</Link>{" "}
						or a{" "}
						<Link
							className="underline font-semibold"
							to="/register/news-member"
						>
							News Member
						</Link>
					</span>
				</div>
				<div className=" px-20 w-full h-28 bg-blue-950 flex items-center justify-between">
					<img
						src="/public/hedgeco-logo.png"
						alt="Hedgeco.net"
						className="ml-24 h-3/4"
					/>
					<div className="h-full">
						<span className="text-white text-sm">
							<Link to="/" className="underline">
								HedgeCo.Net
							</Link>
							{" - "}
							Online Hedge Fund Database and Community
							{" - "}
							{user == null ? (
								<form
									onSubmit={(e) => {
										e.preventDefault();
										login();
									}}
									className="space-y-4 inline-block"
								>
									<button type="submit" className="underline">
										Sign In
									</button>
								</form>
							) : (
								<Link to="/logout" className="underline">
									Sign Out
								</Link>
							)}
						</span>
					</div>
				</div>
				<div className="absolute top-0 left-20 h-[148px] w-20 bg-[#cc0000] flex flex-col text-white text-center justify-center uppercase shadow-md shadow-black/50 ">
					<span className="tracking-[1px] text-[10px]">celebrating</span>
					<span className="leading-[1.125] text-[50px]">20</span>
					<span className="mt-1 tracking-[4px] font-semibold text-[12px]">
						years
					</span>
				</div>
				<div className="flex px-20 py-2 border-b-2 border-gray-300 text-sm font-semibold gap-4 text-cyan-900">
					<Link className="hover:text-blue-950" to="/hedge-funds/search">
						Find a Hedge Fund
					</Link>
					<Link className="hover:text-blue-950" to="/news">
						Hedge Fund News
					</Link>
					<Link className="hover:text-blue-950" to="/service-providers">
						Hedge Fund Service Providers
					</Link>
					<Link className="hover:text-blue-950" to="/conferences">
						Hedge Fund Conferences
					</Link>
					<Link className="hover:text-blue-950" to="/about-us">
						About Hedgeco
					</Link>
				</div>
			</header>
			<main className="min-h-[calc(100vh-148px)] px-20">
				<Outlet />
			</main>
			<footer className="flex flex-col w-full">
				<div className="text-white bg-cyan-800 w-full h-52 flex justify-center px-20 pt-2">
					<div className="flex-1" />
					<div className="flex-1">
						<p className="font-bold">Investors</p>
						<ul className="text-[12px] flex flex-col gap-1">
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/conferences"
								>
									Conferences
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/hedge-funds/search"
								>
									Hedge Fund Search
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/hedge-funds/rankings"
								>
									Hedge Fund Rankings
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/news"
								>
									Hedge Fund Breaking News
								</Link>
							</li>
						</ul>
						<p className="font-bold mt-4">Information / Support</p>
						<ul className="text-[12px] flex flex-col gap-1">
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/legal/doc/$legalDocumentName"
									params={{ legalDocumentName: "terms-of-use" }}
								>
									Terms of Use
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/legal/doc/$legalDocumentName"
									params={{ legalDocumentName: "privacy-policy" }}
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
					<div className="flex-1">
						<p className="font-bold">Hedge Fund Managers</p>
						<ul className="text-[12px] flex flex-col gap-1">
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/managers/benefits"
								>
									Manager Benefits
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/conferences"
								>
									Conferences
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/service-providers"
								>
									Service Providers
								</Link>
							</li>
						</ul>
					</div>
					<div className="flex-1">
						<p className="font-bold">My Account</p>
						<ul className="text-[12px] flex flex-col gap-1">
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/dashboard"
								>
									My Home / Dashboard
								</Link>
							</li>
							<li>
								<Link
									className="border-dotted border-b-white border-b-[1px] hover:border-solid"
									to="/messages"
								>
									My Messages
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="text-white bg-black px-20 flex justify-between items-center gap-4">
					<span className="mr-8">© {new Date().getFullYear()} Hedgeco.Net</span>
					<div className="flex gap-4">
						<span className="text-[11px]">
							<Link to="/about-us">About Us</Link>
						</span>
						<span className="text-[11px]">
							<Link to="/contact-us">Contact Us</Link>
						</span>
						<span className="text-[11px]">
							<Link to="/jobs">Jobs</Link>
						</span>
						<span className="text-[11px]">
							<Link
								to="/legal/doc/$legalDocumentName"
								params={{ legalDocumentName: "terms-of-use" }}
							>
								Terms of Use
							</Link>
						</span>
					</div>
					<div className="flex-grow" />
					<div className="flex gap-4">
						<span className="text-[11px]">
							<Link
								to="/legal/doc/$legalDocumentName"
								params={{ legalDocumentName: "privacy-policy" }}
							>
								hedgeCo Privacy
							</Link>
						</span>
						<span className="text-[11px]">
							<a href="mailto:evan@hedgeco.net">Advertise</a>
						</span>
					</div>
				</div>
			</footer>
		</>
	);
}
