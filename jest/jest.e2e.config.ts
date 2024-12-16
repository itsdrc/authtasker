import type { Config } from 'jest';

const config: Config = {
    rootDir: "./../", // root    
    collectCoverage: false,    
    moduleNameMapper: {
        "^@root/(.*)$": "<rootDir>/src/$1"
    },
    preset: 'ts-jest',
    globalTeardown: "./test/e2e/config/teardown.ts",
    // test files
    roots: ["<rootDir>/test/e2e"],
    testEnvironment: "jest-environment-node",
};

export default config;
