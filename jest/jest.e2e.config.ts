import type { Config } from 'jest';

const config: Config = {
    rootDir: "./../", // root    
    collectCoverage: true,
    coverageDirectory: "./coverage/e2e",
    coverageProvider: "v8",
    moduleNameMapper: {
        "^@root/(.*)$": "<rootDir>/src/$1"
    },
    preset: 'ts-jest',
    // test files
    roots: ["<rootDir>/test/e2e"],
    testEnvironment: "jest-environment-node",
};

export default config;
