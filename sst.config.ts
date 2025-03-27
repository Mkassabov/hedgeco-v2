/// <reference path="./.sst/platform/config.d.ts" />

//todo setup resource sharing for
// - email

export default $config({
	app(input) {
		return {
			name: "hedgecoV2",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: { cloudflare: "5.49.1" },
		};
	},
	// biome-ignore lint/suspicious/useAwait: <explanation>
	async run() {
		const isProduction = $app.stage === "production";
		const hedgecoNetZoneId = "292a2aee7bf6ec6ff365214659c76efa";
		const rootDomain = isProduction
			? "hedgeco.net"
			: `${$app.stage}.hedgeco.net`;
		const webDomain = `v2.${rootDomain}`;
		// const contactEmail = isProduction
		// 	? "contact@hedgeco.net"
		// 	: (process.env.CONTACT_EMAIL ?? "no-reply@hedgeco.net");
		const contactEmail = "michael@neutech.co";

		//* infra
		const hedgecoVpc = new sst.aws.Vpc("HedgecoVpc", {
			bastion: true,
			nat: "ec2",
		});
		const cluster = new sst.aws.Cluster("HedgecoCluster", { vpc: hedgecoVpc });
		//todo this is ugly cause we did local before prod
		const noReplyEmail = new sst.aws.Email("NoReplyEmailService", {
			sender: isProduction
				? "no-reply@hedgeco.net"
				: `no-reply+${$app.stage}@hedgeco.net`,
		});
		//todo use sst secrets
		const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
		const mailchimpServer = process.env.MAILCHIMP_SERVER;
		const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
		const mailchimpTemplateId = process.env.MAILCHIMP_TEMPLATE_ID;
		const mailchimpTestingSegmentId = process.env.MAILCHIMP_TESTING_SEGMENT_ID;

		//* databases
		const hedgecoDatabase = new sst.aws.Aurora("HedgecoDatabase", {
			engine: "mysql",
			vpc: hedgecoVpc,
		});

		//* services
		const adminAuth = new sst.aws.Auth("AdminAuth", {
			issuer: {
				handler: "deployments/admin-auth/src/index.handler",
				link: [noReplyEmail, hedgecoDatabase],
				environment: {
					validClients: JSON.stringify({
						"hedgeco-web": isProduction
							? [webDomain]
							: [webDomain, "localhost"],
					}),
				},
				vpc: hedgecoVpc,
			},
			domain: {
				name: `admin-auth.${rootDomain}`,
				dns: sst.cloudflare.dns({
					zone: hedgecoNetZoneId,
				}),
			},
		});
		const userAuth = new sst.aws.Auth("UserAuth", {
			issuer: {
				handler: "deployments/user-auth/src/index.handler",
				link: [noReplyEmail, hedgecoDatabase],
				environment: {
					validClients: JSON.stringify({
						"hedgeco-web": isProduction
							? [webDomain]
							: [webDomain, "localhost"],
					}),
				},
				vpc: hedgecoVpc,
			},
			domain: {
				name: `user-auth.${rootDomain}`,
				dns: sst.cloudflare.dns({
					zone: hedgecoNetZoneId,
				}),
			},
		});

		new sst.aws.Service("HedgecoWeb", {
			cluster,
			link: [adminAuth, userAuth, hedgecoDatabase, noReplyEmail],
			image: {
				dockerfile: "deployments/hedgeco-web/dockerfile",
			},
			loadBalancer: {
				domain: {
					name: `v2.${rootDomain}`,
					dns: sst.cloudflare.dns({
						zone: hedgecoNetZoneId,
					}),
				},
				ports: [{ listen: "443/https", forward: "3000/http" }],
			},
			dev: {
				directory: "deployments/hedgeco-web",
				command: "bun run dev",
			},
			environment: {
				VITE_ADMIN_AUTH_URL: adminAuth.url,
				VITE_USER_AUTH_URL: userAuth.url,
				CONTACT_EMAIL: contactEmail,
				MAILCHIMP_API_KEY: mailchimpApiKey,
				MAILCHIMP_SERVER: mailchimpServer,
				MAILCHIMP_LIST_ID: mailchimpListId,
				MAILCHIMP_TEMPLATE_ID: mailchimpTemplateId,
				MAILCHIMP_TESTING_SEGMENT_ID: mailchimpTestingSegmentId,
			},
		});

		//* dev resources
		new sst.x.DevCommand("studio", {
			link: [hedgecoDatabase],
			dev: {
				command: "bunx drizzle-kit studio",
				directory: "databases/hedgeco-database",
			},
		});
	},
});
