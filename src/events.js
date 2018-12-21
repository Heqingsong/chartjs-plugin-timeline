import Chart from 'chart.js';
import Element from './element';
const helpers = Chart.helpers;

export default {
    
    proxyEvent: (chartInstance, eventList) => {
        if( Array.isArray(eventList) ) {
            eventList.forEach(eventItem => {
                helpers.addEvent(chartInstance.chart.canvas, eventItem, e => {
                    Chart.TimeLine.configDefaults._mouseup = e;
                    Chart.TimeLine.configDefaults._selected = false;
                    Chart.TimeLine.configDefaults.inBrush = false;
                    Chart.TimeLine.configDefaults.inBrushDrag = false;
                    e.stopImmediatePropagation();
                });
            });
        }
    },

    onClick: (chartInstance, callback) => {
        let status = false;

        if( typeof callback === 'function' ) {
            helpers.addEvent(chartInstance.chart.canvas, 'click', e => {

                let chart = chartInstance.getElementAtEvent(e)[0];
    
                if(!chart) return;

                !Chart.TimeLine.configDefaults.brushDisplay && !Chart.TimeLine.configDefaults.inBrushDrag ? callback(Element.getElement(chartInstance, e)) : null;
                status = true;
            });
        }

        return status;
    },

    onMousedown: chartInstance => {
        let node = chartInstance.chart.ctx.canvas;

        helpers.addEvent(node, 'mousedown', e => {
            Chart.TimeLine.configDefaults._mousedown = e;
            Chart.TimeLine.configDefaults._selected = true;

            if(Chart.TimeLine.configDefaults.inBrush || Chart.TimeLine.configDefaults.inBrushDrag) {
                let offsetX = e.clientX - ( e.target.getBoundingClientRect().left + Chart.TimeLine.configDefaults.brushPosition.left );
                
                Chart.TimeLine.configDefaults.brushPosition.offsetX = offsetX > 0 ? offsetX : 0;
                e.stopImmediatePropagation();
            }
        });
    },

    onMousemove: chartInstance => {
        let node = chartInstance.chart.ctx.canvas;
        let brush = Chart.TimeLine.types.brush;

        helpers.addEvent(node, 'mousemove', e => {

            if(chartInstance.tooltip._active && chartInstance.tooltip._active.length){

                let offset = Chart.TimeLine.configDefaults.brushPosition;

                if(offset.left !== 0 && offset.endX !== 0) Chart.TimeLine.configDefaults.redrawBrush = true;                
            }

            Chart.TimeLine.configDefaults.inBrush =  brush.positionInChartArea(chartInstance, {
              x: e.clientX,
              y: e.clientY
            });
    
            if (Chart.TimeLine.configDefaults._mousedown && Chart.TimeLine.configDefaults._selected) {
              Chart.TimeLine.configDefaults._mouseup = e;
              chartInstance.update(0);
            }
    

            if (chartInstance.options.timeline.brushDisplay && !Chart.TimeLine.configDefaults._selected && !Chart.TimeLine.configDefaults.inBrushDrag) {
              let index = Chart.TimeLine.configDefaults.inBrush ? 0 : 1;
              chartInstance.canvas.style.cursor = Chart.TimeLine.configDefaults._mouseStyle[index];
            }
    
            if(Chart.TimeLine.configDefaults.inBrush || Chart.TimeLine.configDefaults.inBrushDrag) {
              e.stopImmediatePropagation();
            }
    
        });
    },

    onWheel: chartInstance => {
        let node = chartInstance.chart.ctx.canvas;
        let zoom = Chart.TimeLine.types.zoom;
        helpers.addEvent(node, 'wheel', event => {
            let rect = event.target.getBoundingClientRect();
            let offsetX = event.clientX - rect.left;
            let offsetY = event.clientY - rect.top;

            let center = {
                x : offsetX,
                y : offsetY
            };

            if (event.deltaY < 0) {
                zoom.draw(chartInstance, 1.1, center);
            } else {
                zoom.draw(chartInstance, 0.9, center);
            }
        });
    }
}