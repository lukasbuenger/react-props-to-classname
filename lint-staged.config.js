module.exports = {
	"*.{json,js,ts,jsx,tsx}": ["prettier --write", "eslint"],
	"*.{ts,tsx}": () => "tsc -p tsconfig.json",
}
