import * as echarts from 'echarts/core';
import {LineChart,PieChart} from 'echarts/charts';
import {GridComponent,LegendComponent,TooltipComponent,TitleComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
echarts.use([LineChart,PieChart,GridComponent,LegendComponent,TooltipComponent,TitleComponent,CanvasRenderer]);
export {echarts};
