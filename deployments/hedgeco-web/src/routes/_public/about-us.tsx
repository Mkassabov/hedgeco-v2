import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/about-us")({
	component: AboutUsComponent,
});

function AboutUsComponent() {
	return (
		<>
			<h1 className="text-cyan-900 text-2xl font-bold mt-5">About HedgeCo</h1>
			<hr />
			<div className="max-w-[60rem]">
				<br />
				HedgeCo was founded with the goal of to encourage transparency and
				enable easy communication between hedge funds and accredited investors.
				<br />
				<br />
				To further the goal of industry transparency, HedgeCo Networks created
				HedgeCo.Net, a free online hedge fund database. As hedge funds saw the
				value of a free database, the number of hedge funds that report to
				HedgeCo.Net grew, and HedgeCo.Net became the largest independant hedge
				fund database.
				<br />
				<br />
				Funds that report to HedgeCo.Net are required to provide HedgeCo with
				their DDQ, Offering Documents and fill out the HedgeCo fund
				questionnaire. Hedge funds are required to report within 45 days of the
				close of each month to retain their listing on HedgeCo.Net.
				<br />
				<br />
				To ensure that only Accredited Investors have access to the HedgeCo.Net
				database, our team of registered representatives call and screen each
				investor who applies for access to the database.
				<br />
				<br />
				This confluence of fully vetted Accredited Investor user base, and a
				high quality hedge fund database ensure that both the investors and fund
				managers are able to get the most out of the time that they spend on
				HedgeCo.Net.
				<br />
				<br />
				Over the years, HedgeCo has invested heavily in the technology which
				powers the HedgeCo.Net database. Our basic reporting tools were quickly
				replaced with an analytic engine that calculates over 150 return and
				quantitative statistics. Advanced search functionality was built to
				ensure that the high quality data that we gathered on the funds was
				easily accessible to investors who were looking for a fund that matched
				their investment profile.
				<br />
				<br />
				To engage with interested parties who are not (yet) accredited
				investors, HedgeCo developed a hedge fund news section of the site,
				which is also free and available to the public. Over the years, the
				HedgeCo news team has published over 12,000 original stories. We started
				out with a weekly newsletter, but based on public demand, we quickly
				expanded to a daily newsletter, which has become a very popular
				publication.
				<br />
				<br />
				Members of the HedgeCo team are often quoted in major publications as
				well as TV news broadcasts.
				<br />
				<br />
				HedgeCo continues to grow and with each of our new products we make sure
				to remain true to the original goal; To create tools and services which
				help hedge funds communicate better with potential investors.
				<br />
				<br />
				<br />
				<br />
			</div>
		</>
	);
}
