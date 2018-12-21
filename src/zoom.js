import Chart from 'chart.js';
const helpers = Chart.helpers;

const Zoom = Chart.DatasetController.extend({
    initialize(chart, datasetIndex) {},

    rangeMaxLimiter(zoomPanOptions, newMax) {
        if (zoomPanOptions.rangeMax && !helpers.isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])) {
            let rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
            if (newMax > rangeMax) newMax = rangeMax;
        }

        return newMax;
    },

    rangeMinLimiter(zoomPanOptions, newMin) {
        if (zoomPanOptions.rangeMin && !helpers.isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])) {
            let rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
            if (newMin < rangeMin) newMin = rangeMin;
        }

        return newMin;
    },

    zoomTimeScale(scale, zoom, center, zoomOptions) {
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

    zoomIndexScale(scale, zoom, center, zoomOptions) {
        let labels = scale.chart.data.labels;
        let minIndex = scale.minIndex || 0;
        let lastLabelIndex = labels.length - 1;
        let maxIndex = scale.maxIndex || scale.chart.data.labels.length;
        let sensitivity = zoomOptions.sensitivity;
        let chartCenter =  scale.isHorizontal() ? scale.left + (scale.width/2) : scale.top + (scale.height/2);
        let centerPointer = scale.isHorizontal() ? center.x : center.y;
        let zoomNS = Chart.TimeLine.configDefaults.zoom;
    
        zoomNS.zoomCumulativeDelta = zoom > 1 ? zoomNS.zoomCumulativeDelta + 1 : zoomNS.zoomCumulativeDelta - 1;
    
        if (Math.abs(zoomNS.zoomCumulativeDelta) > sensitivity) {
            if (zoomNS.zoomCumulativeDelta < 0) {
                if(centerPointer >= chartCenter) {
                    if (minIndex <= 0) {
                        maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
                    } else {
                        minIndex = Math.max(0, minIndex - 1);
                    }
                } else if(centerPointer < chartCenter) {
                    if (maxIndex >= lastLabelIndex) {
                        minIndex = Math.max(0, minIndex - 1);
                    } else {
                        maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
                    }
                }
                zoomNS.zoomCumulativeDelta = 0;
            } else if(zoomNS.zoomCumulativeDelta > 0) {
                if(centerPointer >= chartCenter) {
                    minIndex = minIndex < maxIndex ? minIndex = Math.min(maxIndex, minIndex + 1) : minIndex;
                } else if(centerPointer < chartCenter) {
                    maxIndex = maxIndex > minIndex ? maxIndex = Math.max(minIndex, maxIndex - 1) : maxIndex;
                }
                zoomNS.zoomCumulativeDelta = 0;
            }
            scale.options.ticks.min = this.rangeMinLimiter(zoomOptions, labels[minIndex]);
            scale.options.ticks.max = this.rangeMaxLimiter(zoomOptions, labels[maxIndex]);
        }
    },

    draw(chartInstance, zoom, center, whichAxes) {
        var ca = chartInstance.chartArea;
        if (!center) {
            center = {
                x: (ca.left + ca.right) / 2,
                y: (ca.top + ca.bottom) / 2,
            };
        }
    
        var zoomOptions = chartInstance.options.timeline.zoom;
    
        if (zoomOptions && helpers.getValueOrDefault(zoomOptions.enabled, Chart.TimeLine.configDefaults.zoom.enabled)) {

            zoomOptions.sensitivity = helpers.getValueOrDefault(zoomOptions.sensitivity, Chart.TimeLine.configDefaults.zoom.sensitivity);
    
            helpers.each(chartInstance.scales, (scale, id) => {
                let time = chartInstance.options.scales.xAxes[0]['type'];
                
                if (scale.isHorizontal()) {
                    if(time !== undefined && time === 'time'){
                        this.zoomTimeScale(scale, zoom, center, zoomOptions);
                    } else {
                        this.zoomIndexScale(scale, zoom, center, zoomOptions);
                    }
                }
            });
    
            chartInstance.update(0);
        }
    }
});

export default Zoom;