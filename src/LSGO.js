/**
  * lsgogroup工具方法库 v0.0.1
  * just support high version browser
  * @author zp
  */
(function (global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() :
	typeof define === "function" && define.amd ? define(function () {
		return factory();
	}) : global.L = factory();
})(this, function (undefined) {
	// 常量定+义
	const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

	var op = Object.prototype,
		ap = Array.prototype,
		toString = op.toString,
		hasOwn = op.hasOwnProperty,
		slice = ap.slice,
		fragmentRE = /^\s*<(\w+|!)[^>]*>/,
		singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,  // <br /> or <hr />
		tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)((\w+)[^>]*)\/>/ig, // correct tag
		simpleSelectorRE = /^[\w-]*$/,
		capitalRE = /([A-Z])/g,
		readyRE = /complete|interactive/,
		formatRE = /(?=(?!^)(\d{3})+$)/g,
		numberRE = /\d+/g,
		table = document.createElement("table"),
		tableRow = document.createElement("tr"),
		tempParent = document.createElement("div"),
		containers = {
			tr: document.createElement("tbody"),
			tbody: table, thead: table, tfoot: table,
			td: tableRow, th: tableRow,
			"*": document.createElement("div") 
		},
		cssNumber = {
			"columns": 1,
			"font-weight": 1,
			"opacity": 1,
			"column-count": 1,
			"z-index": 1
		},
		propMap = {
			"class": "className",
			"maxlength": "maxLength",
			"readonly": "readOnly"
		},
		classCache = {},
		support = {},
		classList;

	function LSGO (dom, selector) {
		var len = dom.length || 0;
		for (var i = 0; i < len; i++)
			this[i] = dom[i];
		this.length = len;
		this.selector = selector || "";
	}
	function isLSGO (obj) {
		return Object.getPrototypeOf(obj) === LSGO.prototype;
	}
	// sizzle
	function qsa (element, selector) {
		var found,
			maybeID = selector.charAt(0) === "#",
			maybeClass = selector.charAt(0) === ".",
			nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
			isSimple = simpleSelectorRE.test(nameOnly);
		return (element.getElementById && isSimple && maybeID) ?
					 ((found = element.getElementById(nameOnly)) ? [found] : []) :
					 (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
					 slice.call(
					 	 isSimple && !maybeID && element.getElementsByClassName ?
					 	 (maybeClass ? element.getElementsByClassName(nameOnly) :
					 	 	  					 element.getElementsByTagName(nameOnly)
					 	 ) : element.querySelectorAll(selector)
					 );
	}
	function matches (element, selector) {
		if (!selector || !element || element.nodeType !== 1)
			return false;
		var temp = "MatchesSelector", 
			matchesSelector = element.matches || element["webkit" + temp] ||
												element["moz" + temp] || element["o" + temp] ||
												element["matchesSelector"];
		if (matchesSelector) 
			return matchesSelector.call(element, selector);
		// fuck browser can't support matchesSelector API
		var match,
			parent = element.parentNode,
			flag = !parent;
		if (flag) {
			(parent = tempParent).appendChild(element);
		}
		// ~-1(=>0) == false,others are not equal false
		match = ~qsa(parent, selector).indexOf(element);
		flag && tempParent.removeChild(element);
		return Boolean(match); 
	}
	// whether array or like array object
	function isArrayLike (obj) {
		var len = obj && obj.length;
		return typeof len === "number" && len >= 0 && len < MAX_ARRAY_INDEX;
	}
	// for dom element
	function uniq (arr) {
		return ap.filter.call(arr, function (item, i) {
			return arr.indexOf(item) === i;
		});
	}
	// accroding to selector to filter nodes 
	function filtered (nodes, selector) {
		return selector ? L(nodes).filter(selector) : L(nodes);
	}
	function children (ele) {
		return "children" in ele ? slice.call(ele.children) :
					 L.map(ele.childNodes, function (node) {
					 		if (node.nodeType === 1)
					 			return node;
					 });									 	
	}	
	// descend dimension
	function flatten (arr) {
		return arr.length > 0 ? L.fn.concat.apply([], arr) : arr;
	}
	function dasherize (str) {
		return str.replace(/([a-z])([A-Z])/g, "$1_$2")
		       .replace(/_/g, "-")
		       .toLowerCase();
	}
	function maybeAddPx (name, value) {
		return (typeof value === "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
	}
	function funcArg (context, arg, idx, payload) {
		return L.isFunction(arg) ? arg.call(context, idx, payload) : arg;
	}
	function setAttribute (node, name, value) {
		value === undefined || value === null ? node.removeAttribute(name) :
																						node.setAttribute(name, value);	
	}
	function className (node, value) {
		return value === undefined ? node.className : (node.className = value);
	}
	function classRE (name) {
		return name in classCache ? classCache[name] :
															 (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
	}
	function deserializeValue (value) {
		try {
			return value ? value === "true" || (
				value === "false" ? false : 
														value === "null" ? 
																						 null : +value + "" === value ? 
																						 															+value : /^[\[\{]/.test(value) ?
																						 																														 JSON.parse(value) : value
			) : value;
		} catch (e) {
			return value;
		}
	}
	function isWindow (obj) {
		return obj && obj === obj.window;
	}
	var L = function () {
		var L = function (selector, context) {
			// 为了让对象的原型链中含有L
			return new L.fn.init(selector, context);
		};

		L.fn = L.prototype = {
			constructor: L,
			init: function (selector, context) {
				var dom;
				if (!selector) 
					dom = [];
				else if (L.isString(selector)) {
					selector = selector.trim();
					if (selector.charAt(0) === "<" && 
							selector.charAt(selector.length - 1) === ">" &&
							fragmentRE.test(selector)) {
						dom = fragment(selector, RegExp.$1, context);
						selector = null;
					} else if (context !== undefined) {
						return L(context).find(selector);
					} else {
						dom = qsa(document, selector);
					}
				}
				else if (L.isFunction(selector)){
					return L(document).ready(selector);
				}
				else if (isLSGO(selector)) {
					return selector;
				}
				else {
					if (L.isArray(selector))
						dom = compact(selector);
					else if (typeof selector === "object") {
						dom = [selector]; 
						selector = null;
					}
				} 
				return new LSGO(dom, selector);
			},
			indexOf: ap.indexOf,
			index: function (element) {
				element = element.get ? element.get(0) : element;
				return ap.indexOf.call(this, element);
			},
			concat: function () {
				var value, args = [];
				for (var i = 0, len = arguments.length; i < len; i++) {
					value = arguments[i];
					args[i] = isLSGO(value) ? value.toArray() : value;
				}
				return ap.concat.apply(isLSGO(this) ? this.toArray() : this, args);
			},
			slice: function () {
				return L(slice.apply(this, arguments));
			},
			// will return a dom element
			get: function (idx) {
				return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
			},
			// will return a L element
			eq: function (idx) {
				// prevent slice(-1, 0)
				return idx === -1 ? this.slice(idx) : this.slice(idx, idx + 1);
			}, 
			first: function () {
				return reChild(this[0]);
			},
			last: function () {
				return reChild(this[this.length - 1]);
			},
			toArray: function () {
				return this.get();
			},
			// DOM Tree has already build,run the callback
			ready: function (callback) {
				if (readyRE.test(document.readyState) && document.body) {
					callback();
				} else {
					document.addEventListener("DOMContentLoaded", function () {
						callback();
					}, false);
				}
				return this;
			},
			// loop the list
			each: function (callback) {
				ap.every.call(this, function (val, i) {
					return callback.call(val, val, i) !== false;
				});
				return this;
			},
			map: function (fn) {
				return L(flatten(ap.map.call(this, function (el, i) {
					return fn.call(el, el, i);
				})));
			},
			add: function (selector, context) {
				return L(uniq(this.concat(L(selector, context))));
			},
			// the first element satisfy the selector
			is: function (selector) {
				return this.length > 0 && matches(this[0], selector);
			},
			not: function (selector) {
				var nodes = [];
				if (L.isFunction(selector)) {
					this.each(function (el) {
						if (!selector.call(this, el))
							nodes.push(this);
					});
				} else {
					var excludes = L.isString(selector) ? this.filter(selector) :
												 isArrayLike(selector) ? slice.call(selector) : L(selector);
					ap.forEach.call(this, function (el) {
						if (excludes.indexOf(el) === -1)
							nodes.push(el);
					});							 		
				}
				return L(nodes);
			},
			filter: function (selector) {
				if (L.isFunction(selector))
					return this.not(this.not(selector));
				return L(ap.filter.call(this, function (el) {
					return matches(el, selector);
				}));
			},
			find: function (selector) {
				var res, self = this;
				if (!selector) {
					res = L();
				} else if (typeof selector === 'object') {
					res = L(selector).filter(function () {
						var node = this;
						return ap.some.call(self, function (parent) {
							return L.contains(parent, node);
						});
					});
				} else if (this.length === 1) {
					res = L(qsa(this[0], selector));
				} else {
					// find all and return a L collection
					res = this.map(function (ele) {
						return qsa(ele, selector);
					});
				}	
				return res;
			},
			// return a collection contains the node which has seletor
			has: function (selector) {
				return this.filter(function () {
					return typeof selector === 'object' ? $.contains(this, selector) :
																								Boolean($(this).find(selector).length);	
				});
			},
			// remove all the node from the zepto object collection
			empty: function () {
				return this.each(function () {
					this.innerHTML = "";
				});
			},
			// get child dom element
			children: function (selector) {
				return filtered(this.map(function () {
					return children(this);
				}), selector);
			},
			// get closest's ancestor element
			closest: function(selector, context) {
				var nodes = [],
					collection = typeof selector === "object" && L(selector);
				this.each(function(node) {
					while (node && 
						!(collection ? 
							collection.indexOf(node) !== -1 :
							matches(node, selector) 
						)
					) {
						node = node !== context && node.parentNode;
					}
					if (node && nodes.indexOf(node) === -1) nodes.push(node);
				});
				return L(nodes);
			},
			// get all child nodes
			contents: function () {
				return this.map(function () {
					return slice.call(this.childNodes);
				});
			},
			// get attribute of the every node in collection, and return an array
			pluck: function (property) {
				return L.map(this, function (ele) {
					return ele[property];
				});
			},
			// accroding to selector to get brother nodes
			siblings: function (selector) {
				return filtered(this.map(function (ele, i) {
					return ap.filter.call(children(ele.parentNode), function (c) {
						return c !== ele;
					});
				}), selector);
			},
			parent: function () {
				return filtered(uniq(this.pluck("parentNode")));
			},	
			clone: function () {
				return this.map(function () {
					return this.cloneNode(true);
				});
			},
			prev: function (selector) {
				return L(this.pluck("previousElementSibling")).filter(selector || "*");
			},
			next: function (selector) {
				return L(this.pluck("nextElementSibling")).filter(selector || "*");
			},
			show: function () {
				return this.each(function () {
					if (getComputedStyle(this, "").getPropertyValue("display") === "none") {
						this.style.display = "block";
					}
				});
			},
			hide: function () {
				return this.css("display", "none");
			},
			css: function (property, value) {
				// to get value
				if (arguments.length < 2) {
					var element = this[0];
					if (typeof property === "string") {
						if (!element) 
							return void 0;
						return element.style[L.camelCase(property)] || 
									 getComputedStyle(element, "").getPropertyValue(property);
					} else if (L.isArray(property)) {
						if (!element)
							return;
						var props = {};
						L.each(property, function (prop) {
							props[prop] = element.style[L.camelCase(prop)] || 
									          getComputedStyle(element, "").getPropertyValue(prop);
						});
						return props;
					}
				}
				var css = "";
				if (L.isString(property)) {
					if (!value && value !== 0) {
						this.each(function () {
							this.style.removeProperty(dasherize(property));
						});
					} else {
						css = dasherize(property) + ":" + maybeAddPx(property, value);
					}
				} else {
					for (var key in property) {
						if (!property[key] && property[key] !== 0) {
							this.each(function () {
								this.style.removeProperty(dasherize(key));
							});
						} else {
							css += dasherize(key) + ":" + maybeAddPx(key, property[key]) + ";";
						}
					}
				}
				return this.each(function () {
					this.style.cssText += ";" + css;
				});
			},
			html: function (html) {
				return arguments.length > 0 ? 
  						 this.each(function (idx) {
  						 	 var originHtml = this.innerHTML;
  						 	 L(this).empty().append(funcArg(this, html, idx, originHtml));
  						 })	: (this.length > 0 ? this[0].innerHTML : null);
			},
			text: function (text) {
				return arguments.length > 0 ?
							 this.each(function (idx) {
							 	 var newText = funcArg(this, text, idx, this.textContent);	
							 	 this.textContent = String(newText) || "";	
							 }) : (this.length > 0 ? this.pluck("textContent").join("") : null);
			},
			// get the attribute which is custom
			attr: function (name, value) {
				return (L.isString(name) && arguments.length === 1) ?
							 (this[0] && this[0].nodeType === 1 ? this[0].getAttribute(name) : undefined) : 
							 this.each(function (ele, i) {
							 	 if (ele.nodeType !== 1) 
							 	 	return void 0;
							 	 if (L.isObject(name)) {
							 	 	for (var key in name) {
							 	 		setAttribute(ele, key, name[key]);
							 	 	}
							 	 } else {
							 	 	 setAttribute(ele, name, funcArg(ele, value, i, ele.getAttribute(name)));
							 	 }
							 });								 
			},
			removeAttr: function (name) {
				return this.each(function (ele, i) {
					ele.nodeType === 1 && name.split(" ").forEach(function (attr) {
						setAttribute(ele, attr);	
					});
				});
			},
			// get the attribute which is DOM element's default attribute
			prop: function (name, value) {
				name = propMap[name] || name;
				return arguments.length > 1 ?
					this.each(function (ele, i) {
						ele[name] = funcArg(ele, value, i, ele[name]);
					}) : this[0] && this[0][name];
			},
			// read or write the dom element's data-*
			data: function (name, value) {
				// remove CamelCase
				name = "data-" + name.replace(capitalRE, "-$1").toLowerCase();
				var data = arguments.length === 1 ? 
									 this.attr(name) : this.attr(name, value);
				return data === null ? void 0 : deserializeValue(data);
			},
			// read or write the form element's value
			val: function (value) {
				return arguments.length === 1 ? 
																			this.each(function (ele, idx) {
																				ele.value = funcArg(ele, value, idx, ele.value);	
																			}) : (this[0] && this[0].multiple) ? L(this[0]).find("option").filter(function () {
																				return this.selected;
																			}).pluck("value") : this[0].value;
			},
			// check out the collection whether has a element,
			// className is name
			hasClass: function (name) {
				if (!name) return false;
				return ap.some.call(this, function (ele) {
					return this.test(className(ele));
				}, classRE(name));
			},
			addClass: function (name) {
				if (!name) return this;
				return this.each(function (ele, idx) {
					if (!("className" in ele)) 
						return void 0;
					classList = [];
					var oldName = className(ele),
						newName = funcArg(ele, name, idx, oldName);
					newName.split(/\s+/g).forEach(function (c) {
						if (!L(ele).hasClass(c))
							classList.push(c);
					});
					classList.length && className(ele, oldName + (oldName ? " " : "") + classList.join(" "));
				});
			},
			removeClass: function (name) {
				return this.each(function (ele, idx) {
					if (!("className" in ele)) 
						return void 0;
					if (name === undefined)
						return className(ele, "");
					classList = className(ele);
					funcArg(ele, name, idx, classList).split(/\s+/g).forEach(function (c) {
						classList = classList.replace(classRE(c), "");
					});
					className(ele, classList.trim());
				});
			},
			// element's className contain name, remove name
			// if not, add name
			toggleClass: function (name) {
				if (!name) return this;
				return this.each(function (ele, idx) {
					var self = L(ele),
						names = funcArg(ele, name, idx, className(ele));
					names.split(/\s+/g).forEach(function (c) {
						!self.hasClass(c) ? self.addClass(c) : self.removeClass(c);
					});	
				});
			} 
		}; 

		L.fn.init.prototype = LSGO.prototype = L.fn;
		/**
		 * extend object
		 * @param  (whether deep, default false),target,source
		 */
		L.extend = L.fn.extend = function () {
			var options,
				target = arguments[0] || {},
				i = 1,
				len = arguments.length,
				deep = false;
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[i++] || {};
			}
			if (typeof target !== "object" && typeof target !== "function") {
				target = {};
			}
			// extend L
			if (i === len) {
				target = this;
				i--;
			}
			for (; i < len; i++) {
				options = arguments[i] || {};
				for (var k in options) {
					if (hasOwn.call(options, k)) {
						if (deep && typeof options[k] === "object") {
							var temp = Array.isArray(options[k]) ? [] : {};
							L.extend(true, temp, options[k]);
						}
						target[k] = options[k];
					}
				}
			}
			return target;
		};
		// some array's methods
		L.extend({
			inArray: function (elem, arr, i) {
				return arr.indexOf(elem, i);
			},
			each: function (obj, callback) {
				var key,
					i = 0,
					len = obj.length,
					isArray = isArrayLike(obj), 
					temp;
				if (isArray) {
					ap.every.call(obj, function (val, i) {
						temp = obj;
						return callback.call(obj, val, i) !== false;
					});
				}	else {
					for (key in obj) {
						if (callback.call(obj, key, obj[key]) === false) {
							return obj;
						}
					}
				}
				return obj;
			},
			map: function (obj, callback) {
				var key,
					i = 0,
					len = obj.length,
					isArray = isArrayLike(obj), 
					value, values = [];
				if (isArray) {
					for (i = 0; i < len; i++) {
						value = callback(obj[i], i);
						if (value) 
							values.push(value);
					}
				}	else {
					for (key in obj) {
						value = callback(obj[i], i);
						if (value)
							values.push(value);
					}
				}
				return flatten(values);
			},
			// merge a with b
			merge: function (first, second) {
				second = L.isArray(second) ? second : [second];
				ap.push.apply(first, second);
				return first;
			},
			// Remove duplicate
			dedupe: function (arr) {
				var cache = {},
					res = [];
				for (var i = 0, item; item = arr[i++];) {
					if (!hasOwn.call(cache, item)) {
						res.push(item);
						cache[item] = 1;
					}
				}
				return res;
			},
			// Upset array's order
			shuffle: function (arr) {
				var len = arr.length,
					temp, i;
				while (len) {
					i = Math.floor(Math.random() * len--);
					temp = arr[len];
					arr[len] = arr[i];
					arr[i] = temp;
				}
				return arr;
			},
			// get the element whick meets the condition
			grep: function (arr, callback) {
				callback = callback || (function () { return true });
				return ap.filter.call(arr, callback);
			},
			BinarySearch: function (arr, value) {
				var left = 0,
					right = arr.length - 1,
					mid;
				while (left <= right) {
					mid = (left + right) >> 1;
					if (arr[mid] === value)
						return mid;
					else if (arr[mid] < value)
						left = mid + 1;
					else 
						right = mid - 1;
				}
				return -1;
			},
			range: function (start, stop, step) {
				if (arguments.length <= 2) {
					step = stop;
					stop = start || 0;
					start = 0;
				}
				step = step || 1;
				var len = Math.max((Math.ceil(stop - start) / step), 0),
					res = [];
				for (var i = 0; i < len; i++, start += step) {
					res[i] = start;
				}
				return res;
			}
		}); 
		// remove undefined and null
		function compact (arr) {
			return arr.filter(function (val) {
				return val !== undefined && val !== null;
			});
		}
		function fragment (html, name, prototies) {
			var dom, nodes, container;
			if (singleTagRE.test(html))
				dom = $(document.createElement(RegExp.$1));
			if (!dom) {
				// correct tag
				html = html.replace(tagExpanderRE, "<$1></$2>");
				if (name === undefined) 
					name = fragmentRE.test(html) && RegExp.$1;
				name = name in containers ? name : "*";
				container = containers[name];
				container.innerHTML = "" + html;
				dom = L.each(slice.call(container.childNodes), function (val) {
					container.removeChild(val);
				});
				// add the element's attribute
				if (L.isPlainObject(prototies)) {
					nodes = L(dom);
				}
			}
			return dom;
		}
		function reChild (c) {
			return c && isLSGO(c) ? c : L(c);
		}
		return L;
	}();
	// judge object's type
	L.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (name) {
		L["is" + name] = function (obj) {
			return toString.call(obj) === "[object " + name + "]";
		};
	});
	// 检测是否为普通对象(不是window对象且直接继承自Object.prototype)
	L.isPlainObject = function(obj) {
		return L.isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
	};
	// judge whether ele is parent child node
	L.contains = document.documentElement.contains ? 
							 function (parent, ele) {
							 		return parent !== ele && parent.contains(ele);	
							 } : 
							 function (parent, ele) {
							 		while (ele && (ele = ele.parentNode)) {
							 			if (ele === parent) return true; 
							 		}
							 		return false;
							 };
	// check out whether obj is numeric, "1" or 1 is ok
	L.isNumeric = function (obj) {
		return !L.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0; 
	};
	// make "xx-xx" to "xxXx"
	L.camelCase = function (str) {
		return str.replace(/-(\w)/g, function (match, chr) {
			return chr ? chr.toUpperCase() : "";
		});
	};
	// make "xxXx" to "xx-xx"
	L.ReverseCamel = function (str) {
		return str.replace(/(?!^)(?!$)[A-Z]{1}/g, function (val) {
			return "-" + val;
		}).toLowerCase();
	};
	L.now = function () {
		return +( new Date() );
	};
	L.error = function (msg) {
		throw new Error(msg);
	};
	L.noop = function () {};
	L.isEmptyObject = function (obj) {
		for (var name in obj) {
			return false;
		}
		return true;
	};
	// make 1000 to 1,000
	L.thousandFormat = function (num) {
		return num && 
					 num.toString()
					 .replace(numberRE, function (val) {
					 		return val.replace(formatRE, ",");	
					 });
	};
	return L;
});