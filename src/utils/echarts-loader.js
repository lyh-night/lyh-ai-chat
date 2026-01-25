import * as echarts from 'echarts/core'

import { BarChart, LineChart, PieChart } from 'echarts/charts'

import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
])

export default echarts
