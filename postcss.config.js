module.exports = {
	plugins: [
		require('postcss-nesting').default,
		require('cssnano')({
			preset: 'default',
		}),
	],
};
