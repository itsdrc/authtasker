import type { Config } from 'jest';

const config: Config = {
    rootDir: "./../", // root    
    collectCoverage: true,
    coverageDirectory: "./coverage/integration",
    coverageProvider: "v8",
    moduleNameMapper: {
        "^@root/(.*)$": "<rootDir>/src/$1"
    },
    globalSetup: "./test/integration/configuration/global/setup.global.ts",
    globalTeardown: "./test/integration/configuration/global/teardown.global.ts",
    setupFilesAfterEnv: ['./test/integration/configuration/test-file/setupAfterEnv.ts'],
    preset: 'ts-jest',
    // test files
    roots: ["<rootDir>/test/integration"],
    testEnvironment: "jest-environment-node",
};

export default config;
