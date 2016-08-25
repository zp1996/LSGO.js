(function () {
	var assert = chai.assert,
		fn = null;
	mocha.ui("bdd");

	describe("LSGO类库测试", () => {
		describe("数组扩展方法测试", () => {				
			it("L.merge", () => {
				fn = L.merge;
				assert(fn([1, 2, 3], [4, 5, 6]).join("") === "123456");
				assert(fn([1, 2, 3], []).join("") === "123");
				assert(fn([], []).join("") === "");
			});
			it("L.BinarySearch", () => {
				fn = L.BinarySearch;
				assert(fn([1, 2, 3], 1) === 0);
				assert(fn([1, 2, 3], -1) === -1);
			});
			it("L.range", () => {
				fn = L.range;
				assert(fn(0, 5, 1).join("") === "01234");
				assert(fn(5, 1).join("") === "01234");
				assert(fn(5).join("") === "01234");
				assert(fn(5, 2).join("") === "024");
				assert(fn(5, 7).join("") === "0");
			});
			it("L.inArray", () => {
				fn = L.inArray;
				assert(fn(1, [1, 2, 3], 1) === -1);
				assert(fn(1, [1, 2, 3]) === 0);
				assert(fn(2, [2, 3, 2, 3], 2) === 2);
			});
			it("L.dedupe", () => {
				fn = L.dedupe;
				assert(fn([1, 1, 1, 1, 1].join("") === "1"));
				assert(fn([1, 2, 3, 4, 5].join("") === "12345"));
				assert(fn([1, 3, 3, 5, 5].join("") === "135"));
			});
		});

		describe("其余扩展方法测试", () => {
			it("L.thousandFormat", () => {
				fn = L.thousandFormat;
				assert(fn(100) === "100");
				assert(fn(1000) === "1,000");
				assert(fn(10000.111) === "10,000.111");
			});
			it("L.camelCase", () => {
				fn = L.camelCase;
				assert(fn("camel-case") === "camelCase");
				assert(fn("camelCase") === "camelCase");
				assert(fn("Lsgo-gr-oup") === "LsgoGrOup");
			});
			it("L.ReverseCamel", () => {
				fn = L.ReverseCamel;
				assert(fn("camelCase") === "camel-case");
				assert(fn("backGroundColor") === "back-ground-color");
				assert(fn("KobeBryant") === "Kobe-bryant");
			});
			it("L.isNumeric", () => {
				fn = L.isNumeric;
				assert(fn("1") === true);
				assert(fn([1]) === false);
				assert(fn(1) === true);
				assert(fn(NaN) === false);
			});
		});
	});

	mocha.run();
}());