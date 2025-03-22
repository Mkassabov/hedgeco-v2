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
		const isProduction = $app.stage === "production";
		const hedgecoNetZoneId = "292a2aee7bf6ec6ff365214659c76efa";
		const rootDomain = isProduction
			? "hedgeco.net"
			: `${$app.stage}.hedgeco.net`;
		const webDomain = `v2.${rootDomain}`;

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
				environment: {
					validClients: JSON.stringify({
						"hedgeco-web": isProduction
							? [webDomain]
							: [webDomain, "localhost"],
					}),
				},
			},
			domain: {
				name: `admin-auth.${rootDomain}`,
				dns: sst.cloudflare.dns({
					zone: hedgecoNetZoneId,
				}),
			},
		});
		const userAuth = new sst.aws.Auth("user-auth", {
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
			},
			domain: {
				name: `user-auth.${rootDomain}`,
				dns: sst.cloudflare.dns({
					zone: hedgecoNetZoneId,
				}),
			},
		});

		new sst.aws.Service("hedgeco-web", {
			cluster,
			link: [adminAuth, userAuth, hedgecoDatabase],
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

		new sst.aws.Service("hedgeco-web-3", {
			cluster,
			link: [adminAuth, userAuth, hedgecoDatabase],
			image: {
				dockerfile: "deployments/hedgeco-web-3/dockerfile",
			},
			loadBalancer: {
				domain: {
					name: `v2-3.${rootDomain}`,
					dns: sst.cloudflare.dns({
						zone: hedgecoNetZoneId,
					}),
				},
				ports: [{ listen: "80/http", forward: "3000/http" }],
			},
			dev: {
				directory: "deployments/hedgeco-web-3",
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
