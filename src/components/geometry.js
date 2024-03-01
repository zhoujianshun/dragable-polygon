/// 判断是否在多边形内部
export function pointInPolygon(polygon, x, y) {
  var inside = false;

  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i].x,
      yi = polygon[i].y;
    var xj = polygon[j].x,
      yj = polygon[j].y;

    var intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/// 检测两条线段是否相交 start
function direction(p, q, r) {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function onSegment(p, q, r) {
  return (
    Math.min(p.x, r.x) <= q.x &&
    q.x <= Math.max(p.x, r.x) &&
    Math.min(p.y, r.y) <= q.y &&
    q.y <= Math.max(p.y, r.y)
  );
}

function segmentsIntersect(A, B, C, D) {
  // 计算四个方向
  let d1 = direction(C, D, A);
  let d2 = direction(C, D, B);
  let d3 = direction(A, B, C);
  let d4 = direction(A, B, D);

  // 检查是否相交
  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }

  // 检查特殊情况：共线且至少一个端点在另一线段上
  if (d1 === 0 && onSegment(C, A, D)) return true;
  if (d2 === 0 && onSegment(C, B, D)) return true;
  if (d3 === 0 && onSegment(A, C, B)) return true;
  if (d4 === 0 && onSegment(A, D, B)) return true;

  return false; // 线段不相交
}
/// 检测两条线段是否相交 end
export function doLinesIntersect(line1, line2) {
  return segmentsIntersect(line1[0], line1[1], line2[0], line2[1]);
}

// 检测多边形是否有相交的边
export function checkForIntersectingLines(points) {
  let length = points.length;
  if (length < 4) {
    return false;
  }
  for (let i = 0; i < length; i++) {
    // 选中第一条线
    const line1 = [points[i], points[(i + 1) % length]];
    // 遍历下一条线
    // 由于不需要比较相邻的，所以索引+2
    for (let j = i + 2; j < length; j++) {
      const line2 = [points[j], points[(j + 1) % length]];
      if (i === 0 && j === length - 1) {
        continue; // 忽略闭合路径的首尾相连的情况
      }
      console.log(`${i} ${j} ${doLinesIntersect(line1, line2)}`);
      if (doLinesIntersect(line1, line2)) {
        return true; // 有相交的边
      }
    }
  }
  return false; // 没有相交的边
}

// function checkForIntersectingLines(points) {
//   const n = points.length;
//   for (let i = 0; i < n; i++) {
//       for (let j = i + 2; j < n; j++) {
//           if (i === 0 && j === n - 1) {
//               continue; // 忽略闭合路径的首尾相连的情况
//           }
//           if (doLinesIntersect(points[i], points[(i + 1) % n], points[j], points[(j + 1) % n])) {
//               return true; // 找到相交的线段
//           }
//       }
//   }
//   return false; // 没有找到相交的线段
// }
