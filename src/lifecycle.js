import Chart from 'chart.js';
import Events from './events';

export default {
    beforeInit: chartInstance => {
        Events.onClick(chartInstance, chartInstance.options.timeline.onClick);
        Events.proxyEvent(chartInstance, ['mouseout', 'mouseup']);
        Events.onMousedown(chartInstance);
        Events.onMousemove(chartInstance);
        if(chartInstance.options.timeline.zoom && chartInstance.options.timeline.zoom.enabled) Events.onWheel(chartInstance);
    },
    
    beforeUpdate: chartInstance => {},

    afterScaleUpdate: chartInstance => {},

    beforeDatasetsDraw: chartInstance => {},

    afterDatasetsDraw: chartInstance => {
        const TYPE = Chart.TimeLine.types;

        TYPE.brush.createOrUpdateBrush(chartInstance);
    },

    afterDraw: chartInstance => {},

    afterInit: chartInstance => {},

    destroy: chartInstance => {},

    afterRender(chartInstance){
        if(chartInstance.tooltip._active && chartInstance.tooltip._active.length === 0 && Chart.TimeLine.configDefaults.redrawBrush){
            let brush = Chart.TimeLine.types.brush;
            brush.draw(chartInstance.chart.ctx, chartInstance.chartArea, Chart.TimeLine.configDefaults.brushPosition.left, Chart.TimeLine.configDefaults.brushWidth);     
        }
    },

    beforeDraw(){},
    
    beforeDatasetDraw(){},

    resize(){}
}