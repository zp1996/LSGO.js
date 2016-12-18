var string = "a b c";
function matchFor() {
	return new RegExp("(?:^| )" + string.replace(" ", " .* ?") + "(?: |$)")
}
var pattern = matchFor();
console.log(pattern.test("a x b c d"));