<template>
  <ScaleBox :width="1920" :height="1080" bgc="transparent" :delay="100" :isFlat="true">
    <div class="vie-container">
      <div class="vie-left">
        <div class="vie-toolbar">
          <div class="vie-btn" @click="exportBtn">下载</div>
          <div class="vie-legend">
            <div class="legendItem">
              <div class="legendSymbol"></div>
              <div>股权控制</div>
            </div>
            <div class="legendItem">
              <div class="legendSymbol"></div>
              <div>协议控制</div>
            </div>
          </div>
        </div>
        <div class="vie-main">
          <div ref="container"></div>
        </div>
      </div>
      <div class="vie-right">
        <div class="vlist">
          <div class="vlist-item" v-for="(item, index) in rightData" :key="index">
            <div class="title">
              <i></i>
              <div>{{ item.name }}</div>
            </div>
            <div class="content">
              <div v-for="(it, ind) in item.list" :key="ind" class="content-item">
                <div class="content-item-orderNum">
                  <div>{{ ind + 1 }}</div>
                </div>
                <div>{{ it.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ScaleBox>
</template>
<script>
import { DagreLayout } from '@antv/layout'
import { Scroller } from '@antv/x6-plugin-scroller'
import { Export } from '@antv/x6-plugin-export'
import { Graph } from '@antv/x6'
import ScaleBox from 'vue2-scale-box'

const staticData = {
  nodes: {
    // 控股人
    shareholder: [
      {
        id: 'x',
        label: '马云',
        isMain: '1',
      },
      {
        id: 'y',
        label: '雅虎',
      },
      {
        id: 'z',
        label: '软银',
      },
      {
        id: 'x1',
        label: '其他控股人',
      },
    ],
    // 境外节点
    outerNode: [
      {
        id: '1',
        label: '阿里巴巴投资集团有限公司（开曼）',
        type: '1',
      },
      {
        id: '2',
        label: '阿里巴巴投资有限公司（BVI）',
        type: '2',
      },
      {
        id: '3',
        label: '淘宝控股有限公司（开曼）',
        type: '2',
      },
      {
        id: '5',
        label: '淘宝中国控股有限公司（香港）',
        type: '2',
      },
      {
        id: '6',
        label: 'ALIBABA.COM控股（开曼）',
        type: '2',
      },
      {
        id: '7',
        label: 'ALIBABA.CO投资M控股（BVI）',
        type: '2',
      },
    ],
    // 境内主体
    innerNode: [
      {
        id: '8',
        label: '淘宝中国软件有限公司',
        type: '3',
      },
      {
        id: '9',
        label: '浙江天猫技术有限公司',
        type: '3',
      },
      {
        id: '10',
        label: '杭州阿里妈妈技术有限公司',
        type: '3',
      },
      {
        id: '11',
        label: '阿里巴巴中国技术有限公司',
        type: '3',
      },
      {
        id: '12',
        label: '阿里软件上海有限公司',
        type: '3',
      },
      {
        id: '13',
        label: '浙江淘宝网络有限公司',
        type: '3',
      },
      {
        id: '14',
        label: '浙江天猫网络有限公司',
        type: '3',
      },
      {
        id: '15',
        label: '杭州阿里技术有限公司',
        type: '4',
      },
      {
        id: '16',
        label: '杭州阿里巴巴广告有限公司',
        type: '4',
      },
      {
        id: '17',
        label: '阿里巴巴云计算有限公司',
        type: '4',
      },
    ],
  },
  // 关系
  edges: [
    // 控股
    { source: 'x', target: '1', label: '30%' },
    { source: 'y', target: '1', label: '30%' },
    { source: 'z', target: '1', label: '30%' },
    { source: 'x1', target: '1', label: '30%' },
    // 境外
    { source: '1', target: '2', label: '30%' },
    { source: '1', target: '3', label: '40%' },
    { source: '3', target: '5', label: '100%' },
    { source: '1', target: '6', label: '30%' },
    { source: '6', target: '7', label: '100%' },
    // // 境内
    { source: '5', target: '8' },
    { source: '5', target: '9' },
    { source: '7', target: '11' },
    { source: '5', target: '10' },
    { source: '7', target: '12' },

    { source: '8', target: '13', isContractControl: true, label: '33%' },
    { source: '9', target: '14', isContractControl: true, label: '33%' },
    { source: '10', target: '15', isContractControl: true, label: '33%' },
    { source: '11', target: '16', isContractControl: true, label: '33%' },
    { source: '12', target: '17', isContractControl: true, label: '33%' },

    // { source: 'x', target: '13' },
    //
  ],
}

export default {
  components: {
    ScaleBox,
  },
  data() {
    return {
      // width: 1920,
      // height: 1080,
      graph: null,
      // 渲染数据
      renderData: {
        nodes: [],
        edges: [],
      },

      // 右侧list数据
      rightData: [
        { type: '1', name: '境外上市主体', list: [] },
        { type: '2', name: '境外关联主体', list: [] },
        { type: '3', name: '境内运营主体', list: [] },
        { type: '4', name: '境内外商独资主体', list: [] },
      ],
      // 境外控股人节点集合
      jwShareholderIdArr: [],
      // 境外主营主体Id集合
      jwSujectNodeIdArr: [],
      //布局
      layout: null,
      // 境外容器
      jwContainer: null,
      // 境内容器
      jnContianer: null,
      // line
      dividerLine: null,
      // 主体控股人
      subjectUserNode: null,
      // 境外上市主体
      jwListedEntityNode: null,
      //
      commonAttr: {
        body: {
          fill: '#fff',
          stroke: '#8f8f8f',
          strokeWidth: 1,
        },
        label: {
          refX: 0.5,
          refY: '100%',
          refY2: 4,
          textAnchor: 'middle',
          textVerticalAnchor: 'top',
        },
        text: {
          fontSize: 14,
          fill: '#fff',
          refX: 0.5,
          refY: 0.5,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontFamily: '微软雅黑',
          text: 'node',
        },
      },
      // 主节点创办人
      subjectUserAttr: {
        image: {
          xlinkHref:
            'data:image/png;base64,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',
        },
      },
      // 境外关联主体属性
      jwRelNodeAttr: {
        image: {
          xlinkHref: `data:image/png;base64,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`,
        },
      },
      // 境外上市主体属性
      jwListedEntityAttr: {
        image: {
          xlinkHref: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkoAAABoCAYAAAAO2N+NAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAMKSURBVHic7dyxTRxBGIbhfwYJbRkkFIBECYjsImfQwXXgCtzBdQAZ0WWIEpAogIQyVidx48BgnS1/KXuynifcneALX2m10+ov8/PtdbW2atWuqsZZVU1/nwEA+E/MVe1t1HiqMbbT5d3j4cv2+9TLzXnfn6xHjXVVnX75TACAZe1atc2+v2+mi/vXqo9Qml9uztu+/6iqb4vOAwBY3sPo++/Txf1rr6rq+5N1iSQAgKqqbx9tVG1+vr1urW3L5zYAgE+7McaqV2urEkkAAIdOq7VV//V3GwAAh1q1q/5xBQAAAH8YZ73ckwQA8C9TX3oBAMCxEkoAAIFQAgAIhBIAQCCUAAACoQQAEAglAIBAKAEABEIJACAQSgAAgVACAAiEEgBAIJQAAAKhBAAQCCUAgEAoAQAEQgkAIBBKAACBUAIACIQSAEAglAAAAqEEABAIJQCAQCgBAARCCQAgEEoAAIFQAgAIhBIAQCCUAAACoQQAEAglAIBAKAEABEIJACAQSgAAgVACAAiEEgBAIJQAAAKhBAAQCCUAgEAoAQAEQgkAIBBKAACBUAIACIQSAEAglAAAAqEEABAIJQCAQCgBAARCCQAgEEoAAIFQAgAIhBIAQCCUAAACoQQAEAglAIBAKAEABEIJACAQSgAAgVACAAiEEgBAIJQAAAKhBAAQCCUAgEAoAQAEQgkAIBBKAACBUAIACIQSAEAglAAAAqEEABAIJQCAQCgBAARCCQAgEEoAAIFQAgAIhBIAQCCUAAACoQQAEAglAIBAKAEABEIJACAQSgAAgVACAAiEEgBAIJQAAAKhBAAQCCUAgKBX1bz0CACAIzT3qva29AoAgOPT3vqo8bT0DACAYzNqPPUaY1tVu6XHAAAckV2Nse3T5d1jq7ZZeg0AwLFo1TbT5d1jr6ra9/dNVT0svAkA4Bg8fLRRtc8n88vNed+frEeNdVWdLjYNAGAZu1Zts+/vm+ni/rXqIJQ+zc+319XaqlW7qhpnVTV99UoAgC8yV7W3UeOpxthOl3ePhy9/Ag2xZZaLPk1KAAAAAElFTkSuQmCC`,
        },
      },
      // 境内主体
      jnWhoiesEntityAttr: {
        image: {
          xlinkHref: `data:image/png;base64,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`,
        },
      },
    }
  },
  methods: {
    init() {
      this.createGraph()
      this.render()
      this.createDivider()
      this.graph.centerContent()
      this.graph.translate(180, -50)
    },

    render() {
      //
      const { nodes, edges } = staticData
      // 渲染节点
      this.renderNodes(nodes)
      // 渲染边
      this.renderEdges(edges)
      // 渲染右侧列表
      this.renderList(nodes)
      // 布局渲染
      this.layoutRenader()
    },

    /**
     * 创建Graph
     */
    createGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        // width: this.width,
        // height: this.height,
        panning: {
          enabled: false,
          eventTypes: ['leftMouseDown', 'mouseWheel'],
        },
        mousewheel: {
          enabled: false,
          modifiers: 'ctrl',
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5,
        },
        autoResize: true,
        interacting: () => {
          return { nodeMovable: false, edgeMovable: false, edgeLabelMovable: false } // 禁用拖拽}
        },
        background: {
          color: 'transparent',
        },
      })

      this.graph.use(
        new Scroller({
          enabled: true,
        })
      )
      this.graph.use(new Export())
    },
    layoutRenader() {
      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB',
        ranksep: 40,
        nodesep: 90,
        // align: 'U',
        // controlPoints: true,
      })
      const model = dagreLayout.layout(this.renderData)
      this.graph.fromJSON(model)
    },

    /**
     * 渲染节点
     */
    renderNodes({ shareholder, outerNode, innerNode }) {
      const nodes = []
      shareholder.map(({ label, id, isMain }) => {
        // 境外主体
        if (isMain) {
          nodes.push(this.createSubjectUserNode({ id, label }))
        }
        // 境外关联企业
        else {
          nodes.push(this.createJwRelNode({ id, label }))
        }

        this.jwShareholderIdArr.push(id)
      })

      // 遍历境外
      outerNode.map(({ type, id, label }) => {
        // 境外主体
        if (type == '1') {
          nodes.push(this.createJwListedNode({ id, label }))
          this.jwSujectNodeIdArr.push(id)
        }
        // 境外关联企业
        else if (type == '2') {
          nodes.push(this.createJwRelNode({ id, label }))
        }
      })
      // 境内节点
      innerNode.map(({ id, label, type }) => {
        // 境内外资独资主体
        if (type == '3') {
          nodes.push(this.createJnWhoiesNode({ id, label }))
        }
        // 境内运营主体
        else if (type == '4') {
          nodes.push(this.createJnSujectNode({ id, label }))
        }
      })

      this.renderData.nodes = nodes
    },

    /**
     * 渲染关系
     */
    renderEdges(edges) {
      let wantData = []
      edges.map((item) => {
        const line = this.createEdges(item)
        wantData.push(line)
      })
      this.renderData.edges = wantData
    },

    /**
     * 渲染右侧列表
     */
    renderList(nodes) {
      const { outerNode, innerNode } = nodes

      outerNode.forEach((n) => {
        if (n.type == '1') {
          this.rightData[0].list.push(n)
        } else if (n.type == '2') {
          this.rightData[1].list.push(n)
        }
      })
      innerNode.forEach((n) => {
        if (n.type == '3') {
          this.rightData[2].list.push(n)
        } else if (n.type == '4') {
          this.rightData[3].list.push(n)
        }
      })
    },
    /**
     *
     * @param {string} source
     * @param {string} target
     * @param {string} label
     * @param {string} isContractControl 是否协议控制 显示虚线
     */
    createEdges({ source, target, label, isContractControl }) {
      const obj = {
        source,
        target,
        attrs: {
          line: {
            stroke: 'rgba(166, 196, 255, 1)',
            strokeWidth: 2,
          },
        },
        label,
        connector: {
          name: 'rounded',
          args: { radius: 10 },
        },
        router: {
          name: 'orth',
          args: {
            startDirections: ['bottom'],
            endDirections: ['top'],
          },
        },

        zIndex: -1,
      }
      if (isContractControl) {
        obj.attrs.line.strokeDasharray = [5, 5]
      }
      if (this.isShareholderNode({ source, target })) {
        obj.router = {
          name: 'manhattan',
          args: {
            startDirections: ['bottom'],
            endDirections: ['top'],
          },
        }
      }
      return obj
    },

    // 添加分割线
    createDivider() {
      const nodeInner = this.graph.getCellById('8')
      const nodeOuter = this.graph.getCellById('5')
      // 计算两个节点的 Y 坐标值
      const y1 = nodeInner.position().y
      const y2 = nodeOuter.position().y
      const cy = y2 + (y1 - y2) / 2
      // 添加分割线
      const config = {
        source: { x: 0, y: cy },
        target: { x: 1920, y: cy },
        attrs: {
          line: {
            stroke: 'rgba(85, 166, 255, 0.5)',
            strokeWidth: 1,
            // strokeDasharray: '5 5', // 设置为虚线
            targetMarker: null,
          },
        },
      }
      this.dividerLine = this.graph.addEdge(config)
      this.createJNDividerLabel()
      this.createJWDividerLabel()
    },

    // 分割线 境内提示label
    createJNDividerLabel() {
      this.graph.addNode({
        x: 50,
        y: this.dividerLine.getTargetPoint().y + 15,
        shape: 'rect',
        width: 96,
        height: 30,
        attrs: {
          body: {
            fill: 'transparent',
            strokeWidth: 1,
            stroke: 'rgba(0, 194, 255, 1)',
            rx: 10,
            ry: 10,
          },
          label: {
            text: '境内',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 'rgba(0, 194, 255, 1)',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
        },
      })
    },

    // 分割线 境内提示label
    createJWDividerLabel() {
      this.graph.addNode({
        x: 50,
        y: this.dividerLine.getTargetPoint().y - 45,
        shape: 'rect',
        width: 96,
        height: 30,
        attrs: {
          body: {
            fill: 'transparent',
            strokeWidth: 1,
            stroke: '#FFB670',
            rx: 10,
            ry: 10,
          },
          label: {
            text: '境外',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFB670',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
        },
      })
    },

    /**
     * 主体创办人节点
     * @param {*} label
     * @param x
     * @param y
     */
    createSubjectUserNode({ id, label }) {
      const obj = {
        id,
        shape: 'image',
        height: 50,
        width: 50,
        label,
        labelCfg: {
          style: {
            fill: '#FFFFFF',
            textShadow: '0px 4px 4px #E57002', // 设置文字阴影属性
          },
        },
        attrs: {
          ...this.commonAttr,
          ...this.subjectUserAttr,
        },
      }
      return obj
    },
    /**
     * 境外关联主体
     * @param {*} param0
     */
    createJwRelNode({ id, label }) {
      const obj = {
        id,
        shape: 'image',
        height: 50,
        width: 300,
        label,
        attrs: {
          body: {
            fill: 'transparent',
          },
          label: {
            fill: 'rgba(51, 51, 51, 1)',
          },
          ...this.jwRelNodeAttr,
        },
      }
      return obj
    },
    /**
     * 境外上市主体
     */
    createJwListedNode({ id, label }) {
      const obj = {
        id,
        shape: 'image',
        height: 50,
        width: 300,
        label,
        attrs: {
          body: {
            fill: 'transparent',
          },
          label: {
            fill: '#fff',
            // textShadow: '0px 4px 4px #E57002', // 设置文本阴影效果
            textShadowBlur: 4, // 模糊度
            textShadowColor: '#E57002', // 阴影颜色
            textShadowOffsetX: 0, // x方向偏移
            textShadowOffsetY: 4, // y方向偏移
          },
          ...this.jwListedEntityAttr,
        },
      }
      return obj
    },
    /**
     * 境内外商独资主体
     */
    createJnWhoiesNode({ id, label }) {
      const obj = {
        id,
        shape: 'image',
        height: 50,
        width: 300,
        label,
        attrs: {
          body: {
            fill: 'transparent',
          },
          label: {
            fill: 'rgba(51, 51, 51, 1)',
          },
          ...this.jnWhoiesEntityAttr,
        },
      }
      return obj
    },
    /**
     * 境内运营主体
     */
    createJnSujectNode({ id, label }) {
      const obj = {
        id,
        shape: 'image',
        height: 50,
        width: 300,
        label,
        attrs: {
          body: {
            fill: 'transparent',
          },
          label: {
            fill: 'rgba(51, 51, 51, 1)',
          },
          ...this.jnWhoiesEntityAttr,
        },
      }
      return obj
    },

    /**
     * 是否境外控股人
     * @param source
     * @param target
     */
    isShareholderNode({ source, target }) {
      let flag = false
      // 主要判断是否境外控股 到 境外主体单位的判断
      if (this.jwShareholderIdArr.indexOf(source) > -1 && this.jwSujectNodeIdArr.indexOf(target) > -1) flag = true
      console.log(source, target)
      console.log(flag)
      return flag
    },

    exportBtn() {
      this.graph.exportPNG('vie_graph.png', { width: 1920, height: 1080, backgroundColor: '#0C3462' })
    },
  },
  mounted() {
    this.init()
  },
}
</script>
<style scoped>
.vie-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  flex-flow: row;
  display: flex;
  position: relative;
  background-image: url('~@/assets/bg.png');
}

.vie-left {
  width: calc(100% - 400px);
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  margin-left: 8px;
}
.vie-right {
  width: 400px;
  padding: 0 8px;
}

.vie-toolbar {
  height: 40px;
  line-height: 40px;
  display: flex;
  padding-top: 4px;
  padding-bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.vie-btn {
  border: 1px solid rgba(172, 225, 255, 0.8);
  width: 92px;
  height: 34px;
  background: transparent;
  color: #ace1ff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 0 10px;
}
.vie-legend {
  display: flex;
  font-size: 16px;
  color: #ffffff;
}
.vie-legend .legendItem {
  display: flex;
  align-items: center;
  margin-right: 11px;
}
.vie-legend .legendItem .legendSymbol {
  width: 32px;
  height: 2px;
  border-radius: 1px;
  border: 1px solid #a6c4ff;
  background-color: #a6c4ff;
  margin: 0 11px;
}
.vie-legend .legendItem:last-of-type .legendSymbol {
  border: 2px dashed #a6c4ff;
  background-color: transparent;
}

.vie-main {
  flex: 1;
  width: 100%;
  height: calc(100% - 40px);
}
.x6-graph > .x6-graph-svg {
  overflow: visible;
}

.vlist {
  color: #fff;
  font-size: 16px;
  cursor: default;
}
.vlist-item {
  display: flex;
  flex-direction: column;
}

.vlist .title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  margin: 12px 0 12px 0;
  background: transparent;
  padding: 0;
}
.vlist .title i {
  background: url('data:img/jpg;base64,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')
    no-repeat;
  background-size: 100% 100%;
  margin-right: 6px;
  width: 26px;
  height: 26px;
  margin-left: -6px;
}
.vlist .content {
  background: linear-gradient(180deg, rgba(6, 82, 138, 0.6) -3%, rgba(14, 48, 90, 0.6) 100%);
  padding: 12px 16px;
  padding-top: 16px;
  box-shadow: 0px 0px 8px 0px #003a8d, inset 0px 2px 10px 0px #00a3ff;
  margin-left: 6px;
  max-height: 220px;
  overflow-y: auto;
}
.vlist .content-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(118, 191, 255, 0.5);
  padding: 16px 0 12px 0;
}
.vlist .content-item:first-of-type {
  padding-top: 0;
}
.vlist .content-item .content-item-orderNum {
  width: 25px;
  height: 15px;
  font-weight: bold;
  font-size: 12px;
  margin-right: 20px;
  background: linear-gradient(74deg, #265294 3%, #0084ff 95%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transform: skewX(-15deg);
}
.vlist .content-item .content-item-orderNum div {
  transform: skewX(15deg);
}
</style>
