module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: [ '(\\.|/)spec\\.ts$' ],
	watchPathIgnorePatterns: [
		'<rootDir>/.git/',
		'<rootDir>/dist/',
		'<rootDir>/node_modules/',
	],
	maxWorkers: 1,
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.spec.json',
		},
	},
	setupFilesAfterEnv: ['./jest.setup.js']
};
