interface Point {
  x: number
  y: number
}

export interface Polygon {
  [T: string]: any
  points: Point[]
  text?: string
  style: {
    strokeColor?: string
    selectedStorkeColor?: string
    lineWidth?: number
    selectedLineWidth?: number
    lineDash?: [number, number]
    font?: string
    fontSize?: number
    color?: string
    pointFillColor?: string
    pointStorkeColor?: string
    keepRectangle?: boolean // 4个点时有效，无法添加点，移动角保持矩形
  }
}
