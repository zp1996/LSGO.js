(function () {
	var assert = chai.assert,
		fn = null;
	mocha.ui("bdd");

	describe("LSGO类库测试", () => {
		describe("DOM相关方法测试", () => {
			it("selector", () => {
				assert(L("#btn").attr("id") === "btn");
				assert(L("button").length === 3);
				assert(L(".container").length === 1);
				assert(L(".container button").length === 3);
			});
			it("text/html", () => {
				assert(L("#btn").text() === "btn");
				assert(L("button").text() === "btntestbtn-test");
				assert(L("#btn").text("change").text() === "change");
			});
			it("is", () => {
				assert(L("button").is("#btn"));
				assert(L(".container").is("div"));
			});
			it("not", () => {
				assert(L("button").not("#btn").get(0) === L("#second").get(0));
				assert(L("button").not("#second").get(0) === L("#btn").get(0));
			});
			it("index", () => {
				assert(L("button").index(document.getElementById("btn")) === 0);
				assert(L("button").index(L("#btn")) === 0);
				assert(L("button").index(L("#second")) === 1);
			});
			it("get", () => {
				assert(L("button").get(0) === document.getElementById("btn"));
				assert(L("button").get(0) === document.getElementsByTagName("button")[0]);
			});
			it("toArray", () => {
				assert(Array.isArray(L("button").toArray()));
				assert(Array.isArray(L("#btn").toArray()));
			});
		});	

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
			it("L.grep", () => {
				fn = L.grep;
				assert(fn([1, 2, 3]).join("") === "123");
				assert(fn([1, 2, 3], val => val < 2).join("") === "1");
				assert(fn([1, 2, 3], val => val < 1).join("") === "");
			});
			it("L.range", () => {
				fn = L.range;
				assert(fn(0, 5, 1).join("") === "01234");
				assert(fn(5, 1).join("") === "01234");
				assert(fn(5).join("") === "01234");
				assert(fn(5, 2).join("") === "024");
				assert(fn(5, 7).join("") === "0");
			});
		});
	
		describe("类型判断方法扩展测试", () => {
			var bool = new Boolean(false),
				boolr = false,
				str = new String("false"),
				strr = "false",
				num = new Number(0),
				numr = 0,
				date = new Date(),
				obj = {},
				arr = [],
				pattern = /\d{1}/,
				fun = () => {},
				error = new Error("test error");
			function judge (fn, type) {
				assert(fn(bool) === ("bool" === type));
				assert(fn(boolr) === ("bool" === type));
				assert(fn(str) === ("string" === type));
				assert(fn(strr) === ("string" === type));
				assert(fn(num) === ("number" === type));
				assert(fn(numr) === ("number" === type));
				assert(fn(date) === ("date" === type));
				assert(fn(obj) === ("object" === type));
				assert(fn(arr) === ("array" === type));
				assert(fn(pattern) === ("regexp" === type));
				assert(fn(error) === ("error" === type));
				assert(fn(fun) === ("function" === type));
			}
			it("L.isBoolean", () => {
				judge(L.isBoolean, "bool");
			});
			it("L.isString", () => {
				judge(L.isString, "string");
			});
			it("L.isNumber", () => {
				judge(L.isNumber, "number");
			});
			it("L.isDate", () => {
				judge(L.isDate, "date");
			});
			it("L.isObject", () => {
				judge(L.isObject, "object");
			});
			it("L.isArray", () => {
				judge(L.isArray, "array");
			});
			it("L.isRegExp", () => {
				judge(L.isRegExp, "regexp");
			});
			it("L.isFunction", () => {
				judge(L.isFunction, "function");
			});
			it("L.isError", () => {
				judge(L.isError, "error");
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
			it("L.isEmptyObject", () => {
				fn = L.isEmptyObject;
				assert(fn({}) === true);
				assert(fn({x: 1}) === false);
				assert(fn(Object.create(null)) === true);
			});
		});
	});

	mocha.run();
}());