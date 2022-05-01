module.exports = {
	printWidth : 100,
	arrowParens : "avoid",
	plugins : [
		require.resolve( "prettier-plugin-organize-imports" ),
	],
	overrides : [
		{
			files : "*.md",
			options : {
				tabWidth : 4
			}
		}
	]
};
