import type { Config } from 'jest';

const config: Config = {
    rootDir: "./../", // root    
    collectCoverage: false,    
    moduleNameMapper: {
        "^@root/(.*)$": "<rootDir>/src/$1"
    },
    preset: 'ts-jest',
    globalSetup: "./test/e2e/configuration/global/setup.global.ts",
    globalTeardown: "./test/e2e/configuration/global/teardown.global.ts",
    setupFilesAfterEnv: ["./test/e2e/configuration/test-file/setupAfterEnv.ts"],
    // test files
    roots: ["<rootDir>/test/e2e"],
    testEnvironment: "jest-environment-node",
    testTimeout: 15000
};

export default config;
