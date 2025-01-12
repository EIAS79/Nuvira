import * as fs from "fs";
import * as path from "path";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const packageJsonPath = path.resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const getLibraryVersion = function (library) {
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const version = (dependencies[library] || devDependencies[library] || "").replace(/^(\^|~)/, "") || "Not installed";
    return version;
};
fetch("https://registry.npmjs.com/-/v1/search?text=nuvira")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    const version = data.objects[0]?.package?.version;
    if (version && getLibraryVersion("nuvira") !== version) {
        console.error(CYAN +
            "Error: Please update nuvira to the latest version (" + version + ")." +
            RESET);
    }
})
    .catch(function (error) { });
export { Nuvira } from "./parser";
;
//# sourceMappingURL=nuvira.js.map