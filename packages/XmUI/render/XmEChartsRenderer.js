import { h, ref, reactive, watch, onMounted, onUpdated } from 'vue'
import XmECharts from '../components/echarts/XmECharts.vue'

//柱状图


// export default {
//   name: 'XmEChartsRenderer',
//   props: {
//     meta: { type: Object, default: () => ({ fields: [], data: [] }) },
//     modelValue: { type: Array, default: () => [] }
//   },
//   setup(props) {
//     return () => {
//       const option = ref({
//         tooltip: {},
//         xAxis: {
//           type: 'category',
//           data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
//         },
//         yAxis: {
//           type: 'value'
//         },
//         series: [
//           {
//             type: 'bar',
//             data: [120, 200, 150, 80, 70]
//           }
//         ]
//       })
//       return h(XmECharts, {
//         option
//       })
//     }
//   }
// }


//折线图(去掉曲线平滑就是把smooth: true属性删去)



export default {
  name: 'XmEChartsRenderer',
  props: {
    meta: { type: Object, default: () => ({ fields: [], data: [] }) },
    modelValue: { type: Array, default: () => [] }
  },
  setup(props) {
    return () => {
      const emailData = [0, 0, 500, 0, 200, 100, 25531.56, 0, 90000, 0, 0, 0, 311608.60, 0, 0, 40000, 500, 600, 0]
      const xAxisData = [
        '2015-11-19', '2015-11-20', '2015-11-21', '2015-11-22', '2015-11-23',
        '2015-11-24', '2015-11-25', '2015-11-26', '2015-11-27', '2015-11-28',
        '2015-11-29', '2015-11-30', '2015-12-01', '2015-12-02', '2015-12-03',
        '2015-12-04', '2015-12-05', '2015-12-06', '2015-12-07'
      ]
      const unionAdsData = [
        22000, 18200, 19100, 23400, 29000, 33000, 31000, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0
      ]

    
      const option = ref({
        title: { text: '折线图' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Email', 'Union Ads'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: xAxisData },
        yAxis: { type: 'value' },
        series: [
          { name: 'Email', type: 'line', data: emailData,},
          { name: 'Union Ads', type: 'line', data: unionAdsData,smooth: true }
        ]
      })

      return h(XmECharts, {option})

              
    }
  }
}

//漏斗图


// export default {
//   name: 'XmFunnelChartRenderer',
//   props: {
//     meta: { type: Object, default: () => ({ fields: [], data: [] }) },
//     modelValue: { type: Array, default: () => [] }
//   },
//   setup(props) {
//     return () => {
//       const option = ref({
//         title: { text: 'Funnel' },
//         tooltip: {
//           trigger: 'item',
//           formatter: '{a} <br/>{b} : {c}%'
//         },
//         toolbox: {
//           feature: {
//             dataView: { readOnly: false },
//             restore: {},
//             saveAsImage: {}
//           }
//         },
//         legend: {
//           data: ['Visit','Inquiry','Order','Click','新客户']
//         },
//         series: [
//           {
//             name: '各阶段客户漏斗分析',
//             type: 'funnel',
//             left: '10%',
//             top: 60,
//             bottom: 60,
//             width: '80%',
//             min: 0,
//             max: 100,
//             minSize: '0%',
//             maxSize: '100%',
//             sort: 'descending',
//             gap: 2,
//             label: { show: true, position: 'inside' },
//             labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
//             itemStyle: { borderColor: '#fff', borderWidth: 1 },
//             emphasis: { label: { fontSize: 20 } },
//             data: [
//               { value: 20, name: 'Visit' },
//               { value: 20, name: 'Inquiry' },
//               { value: 20, name: 'Order' },
//               { value: 20, name: 'Click' },
//               { value: 100, name: '新客户' }
//             ]
//           }
//         ]
//       })

//       return h(XmECharts, { option })
//     }
//   }
// }



//渐变堆叠面积图


// export default {
//   name: 'XmGradientAreaChart',
//   setup() {
//     const option = ref({
//       color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
//       title: { text: 'Gradient Stacked Area Chart' },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
//       },
//       legend: { data: ['Line 1',] },
//       toolbox: { feature: { saveAsImage: {} } },
//       xAxis: [{ type: 'category', boundaryGap: false, data: ['2025-12-12','2025-12-13','2025-12-14','2025-12-15','2025-12-16','2025-12-17','2025-12-18'] }],
//       yAxis: [{ type: 'value' }],
//       series: [
//         {
//           name: 'Line 1',
//           type: 'line',
//           stack: 'Total',
//           smooth: true,
//           lineStyle: { width: 0 },
//           showSymbol: false,
//           areaStyle: {
//             opacity: 0.8,
//             color: {
//               type: 'linear',
//               x: 0, y: 0, x2: 0, y2: 1,
//               colorStops: [
//                 { offset: 0, color: 'rgb(128, 255, 165)' },
//                 { offset: 1, color: 'rgb(1, 191, 236)' }
//               ]
//             }
//           },
//           emphasis: { focus: 'series' },
//           data: [140,232,101,264,90,340,250]
//         },
        
        
//       ]
//     })

//     return () => h(XmECharts, { option })
//   }
// }


