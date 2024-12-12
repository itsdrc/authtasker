import type { Config } from 'jest';

const config: Config = {
    rootDir: "./../", // root    
    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,
    collectCoverage: true,
    coverageDirectory: "./coverage/integration",
    coverageProvider: "v8",    
    moduleNameMapper: {
        "^@root/(.*)$": "<rootDir>/src/$1"
    },
    preset: 'ts-jest',
    // test files
    roots: ["<rootDir>/test/unit"],
    testEnvironment: "jest-environment-node",
};

export default config;
