const DEV = process.env.TS_NODE_DEV === 'true';

const host = process.env.DB_HOST || '127.0.0.1';
const port = 5432;
const username = 'postgres';
const password = '';

module.exports = [
	// Default configuration
	{
		name: 'default',
		type: 'postgres',
		host,
		port,
		username,
		password,
		database: 'ohjelmistoprojekti',
		synchronize: true,
		logging: false,
		entities: [
			`${DEV ? 'src' : 'dist'}/entity/**/*.{js,ts}`
		]
	},
	// Test configuration
	{
		name: 'it',
		type: 'postgres',
		host,
		port,
		username,
		password,
		database: 'ohjelmistoprojekti-it',
		synchronize: true,
		logging: false,
		entities: [
			'src/entity/**/*.ts'
		]
	}
];
