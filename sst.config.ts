/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "hedgeco-v2",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
		};
	},
	// biome-ignore lint/suspicious/useAwait: <explanation>
	async run() {
		const hedgecoVpc = new sst.aws.Vpc("hedgeco-vpc", {
			bastion: true,
		});
		const cluster = new sst.aws.Cluster("hedgeco-cluster", { vpc: hedgecoVpc });

		const primaryDatabase = new sst.aws.Aurora("hedgeco-database", {
			engine: "mysql",
			vpc: hedgecoVpc,
		});

		const noReplyEmail = new sst.aws.Email("no-reply-email-service", {
			sender: "no-reply@hedgeco.net",
		});

		const adminAuth = new sst.aws.Auth("admin-auth", {
			issuer: {
				handler: "deployments/admin-auth/src/index.handler",
				link: [noReplyEmail, primaryDatabase],
			},
		});

		const hedgecoWeb = new sst.aws.Service("hedgeco-web", {
			cluster,
			link: [adminAuth, primaryDatabase],
			environment: {
				adminAuthUrl: adminAuth.url,
			},
			image: {
				dockerfile: "deployments/hedgeco-web/dockerfile",
			},
			loadBalancer: {
				ports: [{ listen: "80/http", forward: "4321/http" }],
			},
			dev: {
				directory: "deployments/hedgeco-web",
				command: "bun run dev",
			},
		});

		new sst.x.DevCommand("studio", {
			link: [primaryDatabase],
			dev: {
				command: "bunx drizzle-kit studio",
				directory: "databases/hedgeco-database",
			},
		});
	},
});
