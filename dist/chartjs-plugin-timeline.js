/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _chart = __webpack_require__(1);

	var _chart2 = _interopRequireDefault(_chart);

	var _brush = __webpack_require__(2);

	var _brush2 = _interopRequireDefault(_brush);

	var _zoom = __webpack_require__(3);

	var _zoom2 = _interopRequireDefault(_zoom);

	var _lifecycle = __webpack_require__(4);

	var _lifecycle2 = _interopRequireDefault(_lifecycle);

	var _element = __webpack_require__(6);

	var _element2 = _interopRequireDefault(_element);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_chart2.default.TimeLine = _chart2.default.TimeLine || {};

	_chart2.default.TimeLine.configDefaults = {
	  brushDisplay: false,
	  _mouseup: null,
	  _mousedown: null,
	  _selected: false,
	  inBrush: false,
	  inBrushDrag: false,
	  _mouseStyle: ['ew-resize', 'default'],
	  brushPosition: {
	    left: 0,
	    right: 0,
	    offsetX: 0,
	    endX: 0
	  },
	  brushWidth: 0,
	  redrawBrush: false,
	  zoom: {
	    enabled: true,
	    sensitivity: 1,
	    limits: {
	      max: 10,
	      min: 0.5
	    },
	    zoomCumulativeDelta: 0
	  },
	  playTimeLineStatus: false,
	  selectedStyleStatus: true
	};

	_chart2.default.TimeLine.types = {
	  brush: new _brush2.default(),
	  zoom: new _zoom2.default()
	};

	_chart2.default.TimeLine.Element = _element2.default;

	_chart2.default.pluginService.register(_lifecycle2.default);
	exports.default = _lifecycle2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = Chart;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _chart = __webpack_require__(1);

	var _chart2 = _interopRequireDefault(_chart);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var helpers = _chart2.default.helpers;

	var Brush = _chart2.default.DatasetController.extend({
	  initialize: function initialize() {},


	  // Determine if the mouse is in the area according to the coordinate position
	  positionInChartArea: function positionInChartArea(chartInstance, position) {
	    if (_chart2.default.TimeLine.configDefaults.brushPosition) {
	      var offsetX = position.x - chartInstance.canvas.offsetLeft;
	      var endX = _chart2.default.TimeLine.configDefaults.brushPosition.right - chartInstance.canvas.offsetLeft;
	      return offsetX >= _chart2.default.TimeLine.configDefaults.brushPosition.left && offsetX <= _chart2.default.TimeLine.configDefaults.brushPosition.right && position.y >= chartInstance.chartArea.top + chartInstance.canvas.offsetTop && position.y <= chartInstance.chartArea.bottom + chartInstance.canvas.offsetTop;
	    } else {
	      return false;
	    }
	  },


	  /**
	   * render brush
	   * @param {CanvasContext} ctx - canvas context
	   * @param {ChartjsObject} chartArea - chartjsArea
	   * @param {Number} startX
	   * @param {Number} rectWidth
	   */
	  draw: function draw(ctx, chartArea, startX, rectWidth) {
	    ctx.save();

	    ctx.beginPath();
	    ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
	    ctx.clip();

	    ctx.strokeStyle = 'rgba(130,130,130,0.9)';
	    ctx.fillStyle = 'rgba(130,130,130,0.3)';
	    ctx.lineWidth = 0.5;

	    ctx.fillRect(startX, chartArea.top, rectWidth, chartArea.bottom - chartArea.top);
	    ctx.strokeRect(startX, chartArea.top, rectWidth, chartArea.bottom - chartArea.top);
	    ctx.restore();
	  },


	  /**
	   * Get the order id of the object in the array according to the ID
	   * @param {Chartjs} chartInstance - chartjsObject
	   * @param {String} id - designation id 
	   */
	  getIndexId: function getIndexId(chartInstance, id) {
	    var index = -1;
	    chartInstance.config.data.datasets.forEach(function (v, k) {
	      if (v._id === id) index = k;
	    });
	    return index;
	  },


	  /**
	   * Get filtered data that already shows usable
	   * @param {Chartjs} chartInstance - chartjsObject
	   * @returns {Array} result
	   */
	  filterDatasetsValues: function filterDatasetsValues(chartInstance) {
	    var _this = this;

	    var list = [];
	    chartInstance.config.data.datasets.map(function (item) {
	      var index = _this.getIndexId(chartInstance, item._id);
	      if (!chartInstance.getDatasetMeta(index).hidden) list.push(item);
	    });

	    return list;
	  },


	  /**
	   * Get an element based on the coordinate position
	   * @param {Chartjs} chartInstance - chartjsObject
	   * @param {Object} position 
	   * @return {ArrayObject} result
	   */
	  getOffsetElement: function getOffsetElement(chartInstance, position) {
	    var list = this.filterDatasetsValues(chartInstance);
	    var result = [];

	    list.forEach(function (items) {
	      var datas = items._meta[0]['data'];
	      var gasket = items.gasket || { data: [] };
	      var filterValues = [];
	      var setFilterValues = function setFilterValues(index, data) {
	        filterValues.push({
	          value: items.data[index],
	          source: data,
	          gasket: gasket.data[index],
	          index: index
	        });
	      };

	      datas.forEach(function (item, index) {
	        var _item$_view = item._view,
	            width = _item$_view.width,
	            x = _item$_view.x,
	            radius = _item$_view.radius;

	        var itemStartX = x - width / 2;
	        var itemEndX = x + width / 2;

	        // 被元素包含
	        var inItem = function inItem(offset) {
	          return offset.left >= itemStartX && offset.left <= itemEndX || offset.endX >= itemStartX && offset.endX <= itemEndX;
	        };

	        // 被选区包含
	        var inBrush = function inBrush() {
	          return itemStartX >= position.left && itemStartX <= position.endX || itemEndX >= position.left && itemEndX <= position.endX || itemStartX >= position.left && itemEndX <= position.endX;
	        };

	        if (items.type === 'bar') {
	          // 被元素包含
	          if (inItem(position)) setFilterValues(index, item);
	          // 被选区包含
	          else if (inBrush()) setFilterValues(index, item);
	        } else if (x - radius / 2 >= position.left && x + radius / 2 <= position.endX) {
	          setFilterValues(index, item);
	        }
	      });

	      filterValues.length ? result.push({
	        id: items._id,
	        type: items.type,
	        label: items.label,
	        data: filterValues,
	        meta: items
	      }) : null;
	    });

	    return result;
	  },
	  createOrUpdateBrush: function createOrUpdateBrush(chartInstance) {
	    var beginPoint = _chart2.default.TimeLine.configDefaults._mousedown,
	        endPoint = _chart2.default.TimeLine.configDefaults._mouseup,
	        offsetX = void 0,
	        left = void 0,
	        right = void 0,
	        ctx = void 0,
	        chartArea = void 0;

	    if (!!beginPoint && !!endPoint) {
	      ctx = chartInstance.chart.ctx;
	      right = Math.max(beginPoint.clientX, endPoint.clientX);
	    }

	    // selected
	    if (_chart2.default.TimeLine.configDefaults._selected && chartInstance.canvas.style.cursor !== _chart2.default.TimeLine.configDefaults._mouseStyle[0]) {
	      chartArea = chartInstance.chartArea;
	      offsetX = beginPoint.target.getBoundingClientRect().left;
	      left = Math.min(beginPoint.clientX, endPoint.clientX);

	      var startX = left - offsetX;
	      startX = startX <= chartInstance.options.timeline.xAxesWidth ? chartInstance.options.timeline.xAxesWidth : startX;

	      var brushWidth = right - offsetX - startX;
	      _chart2.default.TimeLine.configDefaults.brushWidth = brushWidth < chartArea.right - chartArea.left ? brushWidth : chartArea.right - chartArea.left;
	      this.draw(ctx, chartArea, startX, _chart2.default.TimeLine.configDefaults.brushWidth);

	      chartInstance.options.timeline.brushDisplay = true;
	      _chart2.default.TimeLine.configDefaults.brushPosition = {
	        left: startX,
	        right: right - offsetX,
	        endX: right - offsetX
	      };
	    }

	    // move
	    if (chartInstance.canvas.style.cursor === _chart2.default.TimeLine.configDefaults._mouseStyle[0]) {

	      var newMouseDownX = endPoint.clientX - endPoint.target.getBoundingClientRect().left - _chart2.default.TimeLine.configDefaults.brushPosition.offsetX;

	      newMouseDownX = newMouseDownX <= chartInstance.options.timeline.xAxesWidth ? chartInstance.options.timeline.xAxesWidth : newMouseDownX;
	      this.draw(ctx, chartInstance.chartArea, newMouseDownX, _chart2.default.TimeLine.configDefaults.brushWidth);

	      _chart2.default.TimeLine.configDefaults.inBrushDrag = true;
	      _chart2.default.TimeLine.configDefaults.brushPosition.left = newMouseDownX;
	      _chart2.default.TimeLine.configDefaults.brushPosition.endX = _chart2.default.TimeLine.configDefaults.brushPosition.right = newMouseDownX + _chart2.default.TimeLine.configDefaults.brushWidth;
	    }

	    if (_chart2.default.TimeLine.configDefaults.brushPosition && chartInstance.options.timeline.brushDisplay) {
	      var elements = this.getOffsetElement(chartInstance, _chart2.default.TimeLine.configDefaults.brushPosition);
	      chartInstance.options.timeline.onSelected(elements);

	      if (_chart2.default.TimeLine.configDefaults.selectedStyleStatus) {
	        var datasets = chartInstance.config.data.datasets;

	        this.clearChartStyle(chartInstance);

	        // set selected element style 
	        elements.map(function (items) {
	          var updateIndex = [];
	          var style = chartInstance.options.timeline.selected.style.filter(function (i) {
	            return i._id === items.id;
	          })[0];
	          var updateObject = datasets.filter(function (i) {
	            return i._id === items.id;
	          })[0];

	          items.data.map(function (item) {
	            updateIndex.push(item.index);
	          });

	          var newBackgroundColor = [];
	          updateIndex.forEach(function (item) {
	            newBackgroundColor[item] = style.color;
	          });

	          if (items.type === 'bar') updateObject.backgroundColor = newBackgroundColor;else updateObject.pointBackgroundColor = newBackgroundColor;
	        });

	        chartInstance.update(1);
	      }
	    }
	  },
	  clearChartStyle: function clearChartStyle(chartInstance) {
	    chartInstance.config.data.datasets.map(function (item) {
	      if (item.type === 'bar') item.backgroundColor = [];else item.pointBackgroundColor = [];
	    });
	  },
	  destroy: function destroy(chartInstance) {
	    chartInstance.canvas.style.cursor = 'default';
	    _chart2.default.TimeLine.configDefaults.redrawBrush = false;
	    _chart2.default.TimeLine.configDefaults.inBrush = false;
	    chartInstance.options.timeline.brushDisplay = false;
	    _chart2.default.TimeLine.configDefaults.brushDisplay = false;

	    _chart2.default.TimeLine.configDefaults.brushPosition = {
	      left: 0,
	      right: 0,
	      endX: 0
	    };
	    this.clearChartStyle(chartInstance);

	    chartInstance.update(0);
	  },
	  playBrush: function playBrush(chartInstance) {},
	  stopBrush: function stopBrush(chartInstance) {},
	  restoreBrush: function restoreBrush(chartInstance) {}
	});

	exports.default = Brush;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _chart = __webpack_require__(1);

	var _chart2 = _interopRequireDefault(_chart);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var helpers = _chart2.default.helpers;

	var Zoom = _chart2.default.DatasetController.extend({
	    initialize: function initialize(chart, datasetIndex) {},
	    rangeMaxLimiter: function rangeMaxLimiter(zoomPanOptions, newMax) {
	        if (zoomPanOptions.rangeMax && !helpers.isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])) {
	            var rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
	            if (newMax > rangeMax) newMax = rangeMax;
	        }

	        return newMax;
	    },
	    rangeMinLimiter: function rangeMinLimiter(zoomPanOptions, newMin) {
	        if (zoomPanOptions.rangeMin && !helpers.isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])) {
	            var rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
	            if (newMin < rangeMin) newMin = rangeMin;
	        }

	        return newMin;
	    },
	    zoomTimeScale: function zoomTimeScale(scale, zoom, center, zoomOptions) {
	        var options = scale.options;

	        var range;
	        var min_percent;
	        if (scale.isHorizontal()) {
	            range = scale.right - scale.left;
	            min_percent = (center.x - scale.left) / range;
	        } else {
	            range = scale.bottom - scale.top;
	            min_percent = (center.y - scale.top) / range;
	        }

	        var max_percent = 1 - min_percent;
	        var newDiff = range * (zoom - 1);

	        var minDelta = newDiff * min_percent;
	        var maxDelta = newDiff * max_percent;

	        var newMin = scale.getValueForPixel(scale.getPixelForValue(scale.min) + minDelta);
	        var newMax = scale.getValueForPixel(scale.getPixelForValue(scale.max) - maxDelta);

	        var diffMinMax = newMax.diff(newMin);
	        var minLimitExceeded = this.rangeMinLimiter(zoomOptions, diffMinMax) != diffMinMax;
	        var maxLimitExceeded = this.rangeMaxLimiter(zoomOptions, diffMinMax) != diffMinMax;

	        if (!minLimitExceeded && !maxLimitExceeded) {
	            options.time.min = newMin;
	            options.time.max = newMax;
	        }
	    },
	    zoomIndexScale: function zoomIndexScale(scale, zoom, center, zoomOptions) {
	        var labels = scale.chart.data.labels;
	        var minIndex = scale.minIndex || 0;
	        var lastLabelIndex = labels.length - 1;
	        var maxIndex = scale.maxIndex || scale.chart.data.labels.length;
	        var sensitivity = zoomOptions.sensitivity;
	        var chartCenter = scale.isHorizontal() ? scale.left + scale.width / 2 : scale.top + scale.height / 2;
	        var centerPointer = scale.isHorizontal() ? center.x : center.y;
	        var zoomNS = _chart2.default.TimeLine.configDefaults.zoom;

	        zoomNS.zoomCumulativeDelta = zoom > 1 ? zoomNS.zoomCumulativeDelta + 1 : zoomNS.zoomCumulativeDelta - 1;

	        if (Math.abs(zoomNS.zoomCumulativeDelta) > sensitivity) {
	            if (zoomNS.zoomCumulativeDelta < 0) {
	                if (centerPointer >= chartCenter) {
	                    if (minIndex <= 0) {
	                        maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
	                    } else {
	                        minIndex = Math.max(0, minIndex - 1);
	                    }
	                } else if (centerPointer < chartCenter) {
	                    if (maxIndex >= lastLabelIndex) {
	                        minIndex = Math.max(0, minIndex - 1);
	                    } else {
	                        maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
	                    }
	                }
	                zoomNS.zoomCumulativeDelta = 0;
	            } else if (zoomNS.zoomCumulativeDelta > 0) {
	                if (centerPointer >= chartCenter) {
	                    minIndex = minIndex < maxIndex ? minIndex = Math.min(maxIndex, minIndex + 1) : minIndex;
	                } else if (centerPointer < chartCenter) {
	                    maxIndex = maxIndex > minIndex ? maxIndex = Math.max(minIndex, maxIndex - 1) : maxIndex;
	                }
	                zoomNS.zoomCumulativeDelta = 0;
	            }
	            scale.options.ticks.min = this.rangeMinLimiter(zoomOptions, labels[minIndex]);
	            scale.options.ticks.max = this.rangeMaxLimiter(zoomOptions, labels[maxIndex]);
	        }
	    },
	    draw: function draw(chartInstance, zoom, center, whichAxes) {
	        var _this = this;

	        var ca = chartInstance.chartArea;
	        if (!center) {
	            center = {
	                x: (ca.left + ca.right) / 2,
	                y: (ca.top + ca.bottom) / 2
	            };
	        }

	        var zoomOptions = chartInstance.options.timeline.zoom;

	        if (zoomOptions && helpers.getValueOrDefault(zoomOptions.enabled, _chart2.default.TimeLine.configDefaults.zoom.enabled)) {

	            zoomOptions.sensitivity = helpers.getValueOrDefault(zoomOptions.sensitivity, _chart2.default.TimeLine.configDefaults.zoom.sensitivity);

	            helpers.each(chartInstance.scales, function (scale, id) {
	                var time = chartInstance.options.scales.xAxes[0]['type'];

	                if (scale.isHorizontal()) {
	                    if (time !== undefined && time === 'time') {
	                        _this.zoomTimeScale(scale, zoom, center, zoomOptions);
	                    } else {
	                        _this.zoomIndexScale(scale, zoom, center, zoomOptions);
	                    }
	                }
	            });

	            chartInstance.update(0);
	        }
	    }
	});

	exports.default = Zoom;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _chart = __webpack_require__(1);

	var _chart2 = _interopRequireDefault(_chart);

	var _events = __webpack_require__(5);

	var _events2 = _interopRequireDefault(_events);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	    beforeInit: function beforeInit(chartInstance) {
	        _events2.default.onClick(chartInstance, chartInstance.options.timeline.onClick);
	        _events2.default.proxyEvent(chartInstance, ['mouseout', 'mouseup']);
	        _events2.default.onMousedown(chartInstance);
	        _events2.default.onMousemove(chartInstance);
	        if (chartInstance.options.timeline.zoom && chartInstance.options.timeline.zoom.enabled) _events2.default.onWheel(chartInstance);
	    },

	    beforeUpdate: function beforeUpdate(chartInstance) {},

	    afterScaleUpdate: function afterScaleUpdate(chartInstance) {},

	    beforeDatasetsDraw: function beforeDatasetsDraw(chartInstance) {},

	    afterDatasetsDraw: function afterDatasetsDraw(chartInstance) {
	        var TYPE = _chart2.default.TimeLine.types;

	        TYPE.brush.createOrUpdateBrush(chartInstance);
	    },

	    afterDraw: function afterDraw(chartInstance) {},

	    afterInit: function afterInit(chartInstance) {},

	    destroy: function destroy(chartInstance) {},

	    afterRender: function afterRender(chartInstance) {
	        if (chartInstance.tooltip._active && chartInstance.tooltip._active.length === 0 && _chart2.default.TimeLine.configDefaults.redrawBrush) {
	            var brush = _chart2.default.TimeLine.types.brush;
	            brush.draw(chartInstance.chart.ctx, chartInstance.chartArea, _chart2.default.TimeLine.configDefaults.brushPosition.left, _chart2.default.TimeLine.configDefaults.brushWidth);
	        }
	    },
	    beforeDraw: function beforeDraw() {},
	    beforeDatasetDraw: function beforeDatasetDraw() {},
	    resize: function resize() {}
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _chart = __webpack_require__(1);

	var _chart2 = _interopRequireDefault(_chart);

	var _element = __webpack_require__(6);

	var _element2 = _interopRequireDefault(_element);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var helpers = _chart2.default.helpers;

	exports.default = {

	    proxyEvent: function proxyEvent(chartInstance, eventList) {
	        if (Array.isArray(eventList)) {
	            eventList.forEach(function (eventItem) {
	                helpers.addEvent(chartInstance.chart.canvas, eventItem, function (e) {
	                    _chart2.default.TimeLine.configDefaults._mouseup = e;
	                    _chart2.default.TimeLine.configDefaults._selected = false;
	                    _chart2.default.TimeLine.configDefaults.inBrush = false;
	                    _chart2.default.TimeLine.configDefaults.inBrushDrag = false;
	                    e.stopImmediatePropagation();
	                });
	            });
	        }
	    },

	    onClick: function onClick(chartInstance, callback) {
	        var status = false;

	        if (typeof callback === 'function') {
	            helpers.addEvent(chartInstance.chart.canvas, 'click', function (e) {

	                var chart = chartInstance.getElementAtEvent(e)[0];

	                if (!chart) return;

	                !_chart2.default.TimeLine.configDefaults.brushDisplay && !_chart2.default.TimeLine.configDefaults.inBrushDrag ? callback(_element2.default.getElement(chartInstance, e)) : null;
	                status = true;
	            });
	        }

	        return status;
	    },

	    onMousedown: function onMousedown(chartInstance) {
	        var node = chartInstance.chart.ctx.canvas;

	        helpers.addEvent(node, 'mousedown', function (e) {
	            _chart2.default.TimeLine.configDefaults._mousedown = e;
	            _chart2.default.TimeLine.configDefaults._selected = true;

	            if (_chart2.default.TimeLine.configDefaults.inBrush || _chart2.default.TimeLine.configDefaults.inBrushDrag) {
	                var offsetX = e.clientX - (e.target.getBoundingClientRect().left + _chart2.default.TimeLine.configDefaults.brushPosition.left);

	                _chart2.default.TimeLine.configDefaults.brushPosition.offsetX = offsetX > 0 ? offsetX : 0;
	                e.stopImmediatePropagation();
	            }
	        });
	    },

	    onMousemove: function onMousemove(chartInstance) {
	        var node = chartInstance.chart.ctx.canvas;
	        var brush = _chart2.default.TimeLine.types.brush;

	        helpers.addEvent(node, 'mousemove', function (e) {

	            if (chartInstance.tooltip._active && chartInstance.tooltip._active.length) {

	                var offset = _chart2.default.TimeLine.configDefaults.brushPosition;

	                if (offset.left !== 0 && offset.endX !== 0) _chart2.default.TimeLine.configDefaults.redrawBrush = true;
	            }

	            _chart2.default.TimeLine.configDefaults.inBrush = brush.positionInChartArea(chartInstance, {
	                x: e.layerX,
	                y: e.layerY
	            });

	            if (_chart2.default.TimeLine.configDefaults._mousedown && _chart2.default.TimeLine.configDefaults._selected) {
	                _chart2.default.TimeLine.configDefaults._mouseup = e;
	                chartInstance.update(0);
	            }

	            if (chartInstance.options.timeline.brushDisplay && !_chart2.default.TimeLine.configDefaults._selected && !_chart2.default.TimeLine.configDefaults.inBrushDrag) {
	                var index = _chart2.default.TimeLine.configDefaults.inBrush ? 0 : 1;
	                chartInstance.canvas.style.cursor = _chart2.default.TimeLine.configDefaults._mouseStyle[index];
	            }

	            if (_chart2.default.TimeLine.configDefaults.inBrush || _chart2.default.TimeLine.configDefaults.inBrushDrag) {
	                e.stopImmediatePropagation();
	            }
	        });
	    },

	    onWheel: function onWheel(chartInstance) {
	        var node = chartInstance.chart.ctx.canvas;
	        var zoom = _chart2.default.TimeLine.types.zoom;
	        helpers.addEvent(node, 'wheel', function (event) {
	            var rect = event.target.getBoundingClientRect();
	            var offsetX = event.clientX - rect.left;
	            var offsetY = event.clientY - rect.top;

	            var center = {
	                x: offsetX,
	                y: offsetY
	            };

	            if (event.deltaY < 0) {
	                zoom.draw(chartInstance, 1.1, center);
	            } else {
	                zoom.draw(chartInstance, 0.9, center);
	            }
	        });
	    }
	};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Element = function () {
	    function Element() {
	        _classCallCheck(this, Element);
	    }

	    _createClass(Element, [{
	        key: 'addLayerData',
	        value: function addLayerData(chartInstance, data) {
	            var _this = this;

	            this.isArray(data);

	            data.map(function (items) {
	                var update = chartInstance.data.datasets.filter(function (item) {
	                    return item._id === items._id;
	                }) || [];

	                // Update if the data collection already exists
	                if (update.length) {
	                    _this.updateLayerData(chartInstance, [items]);
	                    return;
	                }

	                var target = [];
	                items.data.map(function (value, key) {
	                    if (Object.prototype.toString.call(value) === "[object Object]") {
	                        var index = chartInstance.data.labels.indexOf(value.x);
	                        if (index > -1) target[index] = value.y;
	                    } else {
	                        if (value !== undefined) target[key] = value;else if (value === null) target[key] = null;else target[key] = undefined;
	                    }
	                });

	                items.data = target;
	                chartInstance.data.datasets.push(items);
	            });
	            chartInstance.update();
	        }
	    }, {
	        key: 'removeLayerData',
	        value: function removeLayerData(chartInstance, data) {
	            this.isArray(data);
	            var update = [];
	            data.map(function (item) {
	                update.push({
	                    _id: item.id,
	                    data: [{
	                        x: item.key,
	                        y: null
	                    }]
	                });
	            });

	            this.updateLayerData(chartInstance, update);
	        }
	    }, {
	        key: 'toggleLayer',
	        value: function toggleLayer(chartInstance, id, status) {
	            var index = 0;

	            chartInstance.data.datasets.map(function (k, v) {
	                if (k._id === id) index = v;
	            });

	            if (typeof status !== 'boolean') status = !chartInstance.getDatasetMeta(index).hidden;

	            chartInstance.getDatasetMeta(index).hidden = status;
	            chartInstance.update();
	        }
	    }, {
	        key: 'getElement',
	        value: function getElement(chartInstance, event, callback) {
	            var chartClickValue = chartInstance.getElementAtEvent(event)[0];
	            var sourceData = chartInstance.config.data.datasets[chartClickValue._datasetIndex];
	            var gasket = items.gasket || { data: [] };
	            var meta = chartInstance.getDatasetMeta(chartClickValue._datasetIndex);
	            var label = sourceData.data.filter(function (item) {
	                return item._view === chartClickValue._view;
	            });

	            return {
	                id: sourceData._id,
	                type: sourceData.type,
	                label: sourceData.label,
	                data: {
	                    value: sourceData.data[chartClickValue._index],
	                    source: chartClickValue,
	                    gasket: gasket.data[chartClickValue._index],
	                    index: chartClickValue._index
	                },
	                meta: meta
	            };
	        }
	    }, {
	        key: 'isArray',
	        value: function isArray(data) {
	            if (!Array.isArray(data)) {
	                console.error('param is not Array');
	                return;
	            }
	        }

	        /**
	         * update layer data
	         * @param {Object} data - update data
	         * @example [ { '_id': 1, 'data': [{'x': 2018-12-13, 'y': 80}] } ] - Single data update
	         * 
	         * @example [ { '_id': 1, 'data': [1,2,3,4,5,6] } ] - All data updates
	         * @description In the update method, if the data of data is undefined, the single point update is ignored. If there is null, the single point data is erased.
	         */

	    }, {
	        key: 'updateLayerData',
	        value: function updateLayerData(chartInstance, data) {
	            this.isArray(data);

	            try {
	                data.map(function (items) {
	                    var target = chartInstance.data.datasets.filter(function (item) {
	                        return item._id === items._id;
	                    })[0];

	                    if (!target) {
	                        console.error('According to the configuration data did not match the data set');
	                        return;
	                    }
	                    items.data.map(function (value, key) {
	                        if (Object.prototype.toString.call(value) === "[object Object]") {
	                            var index = chartInstance.data.labels.indexOf(value.x);
	                            if (index > -1) target.data[index] = value.y;
	                        } else {
	                            if (value !== undefined) target.data[key] = value;
	                        }
	                    });
	                });
	                chartInstance.update();
	            } catch (error) {
	                console.error('The data format is incorrect and the update failed!', error);
	            }
	        }
	    }]);

	    return Element;
	}();

	;

	exports.default = new Element();

/***/ })
/******/ ]);