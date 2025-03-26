import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	tsr: {
		appDirectory: "src",
	},
	server: {
		preset: "bun",
		serveStatic: "node",
		nodeModulesDirs: ["./node_modules", "../../node_modules"],
		output: {
			dir: "dist",
		},
		esbuild: {
			options: {
				target: "es2022",
			},
		},
	},
	vite: {
		plugins: [
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
});
