import Chart from 'chart.js';
import Brush from './brush';
import Zoom from './zoom';
import Lifecycle from './lifecycle';
import Element from './element';

Chart.TimeLine = Chart.TimeLine || {};

Chart.TimeLine.configDefaults = {
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

Chart.TimeLine.types = {
  brush: new Brush(),
  zoom: new Zoom(),
}

Chart.TimeLine.Element = Element;

Chart.pluginService.register(Lifecycle);
export default Lifecycle;