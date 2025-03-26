import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

console.log("===================");
console.log(process.env);
console.log(import.meta.env);
console.log("===================");

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
		$env: {
			...process.env,
			...import.meta.env,
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
