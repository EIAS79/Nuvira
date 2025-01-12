import * as fs from "fs";
import * as path from "path";

const CYAN: string = "\x1b[36m";
const RESET: string = "\x1b[0m";

const packageJsonPath: string = path.resolve(process.cwd(), "package.json");
const packageJson: any = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const getLibraryVersion = function(library: string): string {
    const dependencies: any = packageJson.dependencies || {};
    const devDependencies: any = packageJson.devDependencies || {};
    const version: string = (dependencies[library] || devDependencies[library] || "").replace(/^(\^|~)/, "") || "Not installed";
    return version;
};

fetch("https://registry.npmjs.com/-/v1/search?text=nuvira")
    .then(function(response: Response) {
        return response.json();
    })
    .then(function(data: any) {
        const version: string = data.objects[0]?.package?.version;
        if (version && getLibraryVersion("nuvira") !== version) {
            console.error(CYAN +
                "Error: Please update nuvira to the latest version (" + version + ")." +
                RESET);
        }
    })
    .catch(function(error: any) {});

    export { Nuvira } from "./parser";;
    export type * from './types/validator';
    export type * from './types/general';
    export type * from './types/records';
