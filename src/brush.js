import Chart from 'chart.js';
const helpers = Chart.helpers;

const Brush = Chart.DatasetController.extend({

  initialize(){},

  // Determine if the mouse is in the area according to the coordinate position
  positionInChartArea(chartInstance, position) {
    if(Chart.TimeLine.configDefaults.brushPosition){
      let offsetX = position.x - chartInstance.canvas.offsetLeft;
      let endX = Chart.TimeLine.configDefaults.brushPosition.right - chartInstance.canvas.offsetLeft;
      return (offsetX >= Chart.TimeLine.configDefaults.brushPosition.left && offsetX <= Chart.TimeLine.configDefaults.brushPosition.right) && 
             (position.y >= (chartInstance.chartArea.top + chartInstance.canvas.offsetTop) && 
              position.y <= (chartInstance.chartArea.bottom + chartInstance.canvas.offsetTop)
             );
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
  draw(ctx, chartArea, startX, rectWidth) {
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
  getIndexId(chartInstance, id) {
    let index = -1;
    chartInstance.config.data.datasets.forEach((v,k) => {
      if(v._id === id) index = k;
    });
    return index;
  },

  /**
   * Get filtered data that already shows usable
   * @param {Chartjs} chartInstance - chartjsObject
   * @returns {Array} result
   */
  filterDatasetsValues(chartInstance){
    let list = [];
    chartInstance.config.data.datasets.map(item => {
      let index = this.getIndexId(chartInstance, item._id);
      if(!chartInstance.getDatasetMeta(index).hidden) list.push(item);
    });

    return list;
  },

  /**
   * Get an element based on the coordinate position
   * @param {Chartjs} chartInstance - chartjsObject
   * @param {Object} position 
   * @return {ArrayObject} result
   */
  getOffsetElement(chartInstance, position) {
    let list = this.filterDatasetsValues(chartInstance);
    let result = [];
  
    list.forEach(items => {
      let datas = items._meta[0]['data'];
      let gasket = items.gasket || { data:[] };
      let filterValues = [];
      let setFilterValues = (index, data) => {
        filterValues.push({
          value: items.data[index],
          source: data,
          gasket: gasket.data[index],
          index
        });
      }

      datas.forEach((item, index) => {
        let { width, x, radius } = item._view;
        let itemStartX = x - (width / 2);
        let itemEndX = x + (width / 2);

        // 被元素包含
        let inItem = offset => {
          return (offset.left >= itemStartX && offset.left <= itemEndX) || (offset.endX >= itemStartX && offset.endX <= itemEndX)
        }

        // 被选区包含
        let inBrush = () => {
          return (itemStartX >= position.left && itemStartX <= position.endX) || (itemEndX >= position.left && itemEndX <= position.endX) || (itemStartX >= position.left && itemEndX <= position.endX);
        }
        
        if(items.type === 'bar'){
          // 被元素包含
          if( inItem(position) ) setFilterValues(index, item);
          // 被选区包含
          else if( inBrush() ) setFilterValues(index, item);

        } else if( x - (radius / 2) >= position.left && x + (radius / 2) <= position.endX) {
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

  createOrUpdateBrush(chartInstance) {
    let beginPoint = Chart.TimeLine.configDefaults._mousedown,
        endPoint = Chart.TimeLine.configDefaults._mouseup,
        offsetX,
        left,
        right,
        ctx,
        chartArea;

    if (!!beginPoint && !!endPoint) {
      ctx = chartInstance.chart.ctx;
      right = Math.max(beginPoint.clientX, endPoint.clientX);
    }

    // selected
    if (Chart.TimeLine.configDefaults._selected && chartInstance.canvas.style.cursor !== Chart.TimeLine.configDefaults._mouseStyle[0]) {
      chartArea = chartInstance.chartArea;
      offsetX = beginPoint.target.getBoundingClientRect().left;
      left = Math.min(beginPoint.clientX, endPoint.clientX);

      let startX = left - offsetX;
          startX = startX <= chartInstance.options.timeline.xAxesWidth ? chartInstance.options.timeline.xAxesWidth : startX;

      let brushWidth = (right - offsetX) - startX;
      Chart.TimeLine.configDefaults.brushWidth = brushWidth < (chartArea.right - chartArea.left) ? brushWidth : (chartArea.right - chartArea.left);
      this.draw(ctx, chartArea, startX, Chart.TimeLine.configDefaults.brushWidth);

      chartInstance.options.timeline.brushDisplay = true;
      Chart.TimeLine.configDefaults.brushPosition = {
        left: startX,
        right: right - offsetX,
        endX: right - offsetX
      };
    }

    // move
    if(chartInstance.canvas.style.cursor === Chart.TimeLine.configDefaults._mouseStyle[0]) {

      let newMouseDownX = endPoint.clientX - endPoint.target.getBoundingClientRect().left - Chart.TimeLine.configDefaults.brushPosition.offsetX;
      
      newMouseDownX = newMouseDownX <= chartInstance.options.timeline.xAxesWidth ? chartInstance.options.timeline.xAxesWidth : newMouseDownX;
      this.draw(ctx, chartInstance.chartArea, newMouseDownX, Chart.TimeLine.configDefaults.brushWidth);
      
      Chart.TimeLine.configDefaults.inBrushDrag = true;
      Chart.TimeLine.configDefaults.brushPosition.left = newMouseDownX;
      Chart.TimeLine.configDefaults.brushPosition.endX = Chart.TimeLine.configDefaults.brushPosition.right = newMouseDownX + Chart.TimeLine.configDefaults.brushWidth;
    }

    if(Chart.TimeLine.configDefaults.brushPosition && chartInstance.options.timeline.brushDisplay) {
      let elements = this.getOffsetElement(chartInstance, Chart.TimeLine.configDefaults.brushPosition);
      chartInstance.options.timeline.onSelected(elements);
      
      if(Chart.TimeLine.configDefaults.selectedStyleStatus) {
        let datasets = chartInstance.config.data.datasets;

        this.clearChartStyle(chartInstance);

        // set selected element style 
        elements.map(items => {
          let updateIndex = [];
          let style = chartInstance.options.timeline.selected.style.filter(i => i._id === items.id)[0];
          let updateObject = datasets.filter(i => i._id === items.id)[0];

          items.data.map(item => {
            updateIndex.push(item.index);
          });

          let newBackgroundColor = [];
          updateIndex.forEach(item => {
            newBackgroundColor[item] = style.color;
          });

          if(items.type === 'bar') updateObject.backgroundColor = newBackgroundColor;
          else updateObject.pointBackgroundColor = newBackgroundColor;
          
        });

        chartInstance.update(1);

      }
    }
  },

  clearChartStyle(chartInstance) {
    chartInstance.config.data.datasets.map(item => {
      if(item.type === 'bar') item.backgroundColor = [];
      else item.pointBackgroundColor = [];
    });
  },

  destroy(chartInstance) {
    chartInstance.canvas.style.cursor = 'default';
    Chart.TimeLine.configDefaults.redrawBrush = false;
    Chart.TimeLine.configDefaults.inBrush = false;
    chartInstance.options.timeline.brushDisplay = false;
    Chart.TimeLine.configDefaults.brushDisplay = false;
    
    Chart.TimeLine.configDefaults.brushPosition = {
      left: 0,
      right: 0,
      endX: 0
    };
    this.clearChartStyle(chartInstance);

    chartInstance.update(0);
  },

  playBrush(chartInstance) {

  },
  
  stopBrush(chartInstance) {

  },

  restoreBrush(chartInstance) {

  }
});

export default Brush;