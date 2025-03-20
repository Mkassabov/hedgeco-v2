/// <reference path="./.sst/platform/config.d.ts" />

//todo setup resource sharing for
// - email

export default $config({
	app(input) {
		return {
			name: "hedgeco-v2",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: { cloudflare: "5.49.1" },
		};
	},
	// biome-ignore lint/suspicious/useAwait: <explanation>
	async run() {
		const hedgecoNetZoneId = "292a2aee7bf6ec6ff365214659c76efa";
		const rootDomain =
			$app.stage === "production" ? "hedgeco.net" : `${$app.stage}.hedgeco.net`;
		//* infra
		const hedgecoVpc = new sst.aws.Vpc("hedgeco-vpc", {
			bastion: true,
		});
		const cluster = new sst.aws.Cluster("hedgeco-cluster", { vpc: hedgecoVpc });
		const noReplyEmail = new sst.aws.Email("no-reply-email-service", {
			sender: "no-reply@hedgeco.net",
		});

		//* databases
		const hedgecoDatabase = new sst.aws.Aurora("hedgeco-database", {
			engine: "mysql",
			vpc: hedgecoVpc,
		});

		//* services
		const adminAuth = new sst.aws.Auth("admin-auth", {
			issuer: {
				handler: "deployments/admin-auth/src/index.handler",
				link: [noReplyEmail, hedgecoDatabase],
			},
			domain: {
				name: `admin-auth.${rootDomain}`,
				dns: sst.cloudflare.dns({
					zone: hedgecoNetZoneId,
				}),
			},
		});

		new sst.aws.Service("hedgeco-web", {
			cluster,
			link: [adminAuth, hedgecoDatabase],
			environment: {
				adminAuthUrl: adminAuth.url,
			},
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
				ports: [{ listen: "80/http", forward: "4321/http" }],
			},
			dev: {
				directory: "deployments/hedgeco-web",
				command: "bun run dev",
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
