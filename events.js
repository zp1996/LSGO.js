(function (L) {
	// 此代码，完全照搬自zepto源码，注释为本人添加
	var slice = Array.prototype.slice,
		_id = 1,
		handlers = {},
		focus = {
			focus: "focusin",
			blur: "focusout"
		},
		hover = {
			mouseenter: "mouseover",
			mouseleave: "mouseout"
		},
		focusinSupported = "onfocusin" in window,
		returnTrue = function() { return true; },
		returnFalse = function() { return false; },
		// 创建代理对象是，忽略对象的这些属性
		ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
		eventMethods = {
	        preventDefault: "isDefaultPrevented",    // 阻止默认事件
	        stopImmediatePropagation: "isImmediatePropagationStopped",  // 阻止冒泡且阻止其它事件执行
	        stopPropagation: "isPropagationStopped"  // 阻止事件冒泡
	    }, specialEvents = {};
	// 事件对象为MouseEvents类型
	specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = "MouseEvents";
	// 生成唯一id标识
	function get_id(ele) {
		return ele._id || (ele._id = _id++);
	}
	function parse(event) {
		var parts = ("" + event).split(".");
		return {
			e: parts[0],
			ns: parts.slice(1).sort().join(' ')
		}
	}
	// 找出复合条件的事件
	// 当event不传入时,则将element上的所事件移除
	// 当fn不传入时,则将该事件下的event事件移除
	function findHandlers(element, event, fn, selector) {
		event = parse(event);
		if (event.ns) {
			var matcher = matchFor(event.ns);
		}
		return (handlers[get_id(element)] || []).filter(function(handler) {;
			return handler &&
				(!event.e  || event.e == handler.e) &&
				(!event.ns || matcher.test(handler.ns)) &&
				(!fn 	   || get_id(fn) === get_id(handler.fn)) &&
				(!selector || selector == handler.sel);
		});
	}
	// 得到可行的事件名
	// 将mouseenter转为mouseover,mouseleave转为mouseout
	// 将focus转为focusin,blur转为focusout
	function realEvent(type) {
		return hover[type] || (focusinSupported && focus[type]) || type;
	}
	// 确定事件的执行阶段 冒泡阶段or捕获阶段
	// focus与blur事件不支持冒泡,利用捕获来替代冒泡
	function eventCapture(handler, captureSetting) {
		return handler.del || 
			(!focusinSupported && (handler.e in focus)) ||
			!!captureSetting;
	}
	// 生成命名空间的正则
	function matchFor() {
		return new RegExp("(?:^| )" + string.replace(" ", " .* ?") + "(?: |$)")
	}
	// 接受一个已有的函数，并返回一个带特定上下文的新的函数
	L.proxy = function(fn, context) {
		var args = (arguments.length > 2) &&
			slice.call(arguments, 2);
		if (L.isFunction(fn)) {
			var proxyFn = function() {
				fn.apply(
					context,
					args ? 
						args.concat(slice.call(arguments)) :
						arguments
				);
			};	
			proxyFn._id = get_id(fn);
			return proxyFn;
		} else if (L.isString(context)) {
			if (args) {
				args.unshift(fn[context], fn);
				return L.proxy.apply(null, args);
			} else {
				return L.proxy(fn[context], fn);
			}
		} else {
			throw new TypeError("arguments's type error");
		}
	}; 
	// 添加事件
	function add(element, events, fn, data, selector, delegator, capture){
		var id = get_id(element),
			set = handlers[id] || (handlers[id] = []);
		// 多个事件传入时,利用空格来进行分离
		events.split(/\s/).forEach(function(event) {
			if (event === "ready") 
				return $(document).ready(fn);
			var handler = parse(event);
			handler.fn = fn;
			handler.sel = selector;
			if (handler.e in hover) {
				fn = function(e) {
					var related = e.relatedTarget;
					// relatedTarget属性仅对mouseout,mouseover有效
					// mouseover而言,是指移入目标节点前离开的那个节点
					// mouseout而言,是指移出目标节点进入的那个节点
					// e.relatedTarget等于目标节点且该节点不是目标节点的子节点
					// 则证明该事件已经触发完成,可以执行相应的事件处理函数
					if (
						!related || 
						(this !== related &&
						!L.contains(this, related))
					) {
						return handler.fn.apply(this, arguments);
					}
				};
			}
			handler.del = delegator;
			var callback = delegator || fn;
			handler.proxy = function(e) {
				e = compatible(e);
				if (e.isImmediatePropagationStopped()) {
					return void 0;
				}
				e.data = data;
				// return false => 进行阻止默认事件与事件冒泡
				// callback函数绑定在了element上
				// _args仅仅在trigger和triggerHandler方式调用时才有
				var result = callback.apply(
					element, 
					e._args == null ? [e] : [e].concat(e._args)
				);
				if (result === false) {
					e.preventDefault();
					e.stopPropagation();
				}
				return result;
			};
			// 标记handler位置
			handler.i = set.length;
			set.push(handler);
			if ("addEventListener" in element) {
				element.addEventListener(
					realEvent(event), 
					handler.proxy, 
					eventCapture(handler, capture)
				);
			}
		});
	}
	// 移除事件
	function remove(element, events, fn, selector, capture) {
		var id = get_id(element);
		(events || "").split(/\s/).forEach(function(event) {
			findHandlers(element, event, fn, selector).forEach(function(handler) {
				delete handlers[id][handler.i];
				if ("removeEventListener" in element) {
					element.removeEventListener(
						realEvent(handler.e),
						handler.proxy,
						eventCapture(handler, capture)
					);
				}
			});	
		});
	}
	// event=>代理的event对象,source=>原生的event对象
	function compatible(event, source) {
		if (source || !event.isDefaultPrevented) {
			source = source || event;
			L.each(eventMethods, function(name, predicate) {
				var sourceMethod = source[name];  // 取原生的方法
				// 调用相应的方法后,将其is...()标记为true
				event[name] = function() {
					this[predicate] = returnTrue;
					return sourceMethod && sourceMethod.apply(source, arguments);
				};
				event[predicate] = returnFalse;
			    try {
			    	// 设置事件的执行时间
	        		event.timeStamp || (event.timeStamp = Date.now())
	     		} catch (ignored) { }
	     		// e.defaultPrevented：DOM3
	     		// 此处为查看默认事件是否已经被取消
	     		if (
	     			source.defaultPrevented != null ? 
	  					source.defaultPrevented :
	     				"returnValue" in source ? 
	     					(source.returnValue === false) :
	     					source.getPreventDefault && source.getPreventDefault()
	     		) {
	     			event.isDefaultPrevented = returnTrue;
	     		}
			});
		}
		return event;
	}
	// 创建代理对象
	function createProxy(event) {
		var key, proxy = { originEvent: event };
		for (key in event) {
			if (!ignoreProperties.test(key) && event[key] !== undefined) {
				proxy[key] = event[proxy];
			}
		}
		return compatible(event);
	}
	// 绑定事件
	// event可以是对象，也可是字符串
	// 只传入event，data，callback时，为bind方法
	// 只传入event，selector，callback时为delegate or live
	// 传入了one参数时，则为one方法
	L.fn.on = function(event, selector, data, callback, one) {
		var autoRemove, 
			delegator, 
			$this = this;
		// 假若传入的event为对象
		if (event && !L.isString(event)) {
			L.each(event, function(type, fn) {
				$this.on(type, selector, data, fn, one);
			});
			return $this; 
		}
		// 假如未传入selector的情况,bind就是这种情况
		if (!L.isString(selector) && !L.isFunction(callback) && callback !== false) {
			callback = data;
			data = selector;
			selector = undefined;			
		}	
		// data未传入,将callback设为data对应的值
		if (callback === undefined || data === false) {
			callback = data;
			data = undefined;
		}
		// 传入false为处理函数,默认为阻止默认事件,阻止冒泡
		if (callback === false) callback = returnFalse;
		return $this.each(function(element) {
			if (one) {
				autoRemove = function(e) {
					// one为绑定的事件函数执行一次后,就移除该事件
					remove(element, e.type, callback);
					return callback.apply(this, arguments);
				};
			}
			if (selector) {
				// 事件委托实现,找到选择器对应的元素时,执行该事件
				delegator = function(e) {
					var evt,
						match = L(e.target).closest(selector, element).get(0);
					if (match && match !== element) {
						// 生成代理事件对象
						evt = L.extend(createProxy(e), {
							currentTarget: match,
							liveFired: element
						});
						return (autoRemove || callback).apply(
							match, 
							[evt].concat(slice.call(arguments, 1))
						);
					}
				};
			}
			add(element, event, callback, data, selector, delegator || autoRemove);
		});
	};
	// 移除事件
	// 不传入参数时，则将该节点上的所有事件移除
	L.fn.off = function(event, selector, callback) {
		var $this = this;
		if (event && !L.isString(event)) {
			$.each(event, function(type, fn) {
				$this.off(type, selector, fn);
			});
			return $this;
		}
		if (!L.isString(selector) && !L.isFunction(callback) && callback !== false) {
			callback = selector;
			selector = undefined;
		}
		if (callback === false) {
			callback = returnFalse;
		}
		return $this.each(function() {
			remove(this, event, selector, callback);
		});
	};
	// 绑定事件
	L.fn.bind = function(event, data, callback) {
		return this.on(event, data, callback);
	};
	L.fn.unbind = function(event, callback) {
		return this.off(event, callback);
	};
	// 事件委托
	L.fn.delegate = function(selector, event, callback) {
		return this.on(event, selector, callback);
	};
	L.fn.undelegate = function(selector, event, callback) {
		return this.off(event, selector, callback);
	};
	// 给符合目前选择器的元素添加事件委托
	L.fn.live = function(event, callback) {
		$(document).delegate(this.selector, event, callback);
		return this;
	};
	L.fn.die = function(event, callback) {
		$(document).undelegate(this.selector, event, callback);
		return this;
	};
	// 该事件仅仅执行一次
	L.fn.one = function(event, selector, data, callback) {
		return this.on(event, selector, data, callback, 1);
	};
	// 触发事件,zepto的触发事件只能作用于DOM上
	L.fn.trigger = function(event, args) {
		event = (L.isString(event) || L.isPlainObject(event)) ? L.Event(event) : compatible(event);
		event._args = args;
		return this.each(function() {
			if (event.type in focus && typeof this[event.type] === "function") {
				this[event.type]();
			} else if ("dispatchEvent" in this) {  // 浏览器原生触发事件API
				this.dispatchEvent(event);
			} else {
				L(this).triggerHandler(event, args);
			}
 		});
	};
	// 仅在当前元素上触发事件，不会发生冒泡
	// 根据对应事件筛选出其执行函数，调用其执行函数
	L.fn.triggerHandler = function(event, args) {
		var e, result;
		this.each(function(element, i) {
			e = createProxy(L.isString(event) ? $.Event(event) : event);
			e._args = args;
			e.target = element;
			L.each(findHandlers(element, event.type || event), function(handler) {
				result = handler.proxy(e);
				if (e.isImmediatePropagationStopped()) return false;
			});
		});
		return result;
	};
	// 简化bind方法，直接$().click()即可
	// 传入了函数，则为注册事件
	// 未传入参数，则为触发事件
	("focusin focusout focus blur load resize scroll unload click dblclick " +
	  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	  "change select keydown keypress keyup error").split(" ").forEach(function(event) {
	    L.fn[event] = function(callback) {
	      return (arguments.length === 1) ?
	        this.bind(event, callback) :
	        this.trigger(event)
	    }
	});
	// 创建Event对象
	// bubbles，默认为true，冒泡时处理
	L.Event = function(type, props) {
		if (!L.isString(type)) {
			props = type;
			type = props.type;
		}
		var event = document.createEvent(specialEvents[type] || "Events"),
			bubbles = true;
		if (props) {
			for (var name in props) {
				if (name === "bubbles") {
					bubbles = !!props[name];
				} else {
					event[name] = bubbles[name];
				}
			}
		}
		// initEvent初始化事件对象
		// 事件类型,是否冒泡,是否可以阻止默认事件
		event.initEvent(type, bubbles, true);
		return compatible(event);
	};
})(L);