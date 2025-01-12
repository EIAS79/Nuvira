"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nuvira = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
var parser_1 = require("./parser");
Object.defineProperty(exports, "Nuvira", { enumerable: true, get: function () { return parser_1.Nuvira; } });
;
//# sourceMappingURL=nuvira.js.map