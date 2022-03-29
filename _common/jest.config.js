process.env.TZ = 'UTC';

const TS_CONFIG_PATH = './tsconfig.json';
const SRC_PATH = '<rootDir>';

module.exports = {
    testMatch: ['**/__tests__/**/(*.)+(spec|test).ts', '**/?(*.)+(spec|test).ts'],
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/'],
    preset: 'ts-jest',
    transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
    moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageReporters: ['lcov', 'html'],
};

function makeModuleNameMapper(srcPath, tsconfigPath) {
    // Get paths from tsconfig
    const tsconfig = require(tsconfigPath);
    let paths;
    if (tsconfig.compilerOptions.paths) {
        paths = tsconfig.compilerOptions.paths;
    } else {
        return {};
    }

    const aliases = {};

    // Iterate over paths and convert them into moduleNameMapper format
    Object.keys(paths).forEach(item => {
        const key = item.replace('/*', '/(.*)');
        const path = paths[item][0].replace('/*', '/$1');
        aliases[key] = srcPath + '/' + path;
    });

    return aliases;
}
