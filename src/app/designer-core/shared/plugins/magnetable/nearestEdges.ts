import { Position, GuidType, MagnetCornerType } from '@designer-core/shared/types';
import { IContextMagnet } from './context';
import { GuidSizePosition, NearestResult } from './types';

type Quadro<T> = [T, T, T, T];

export enum EdgeType {
    LeftVertical = 'left-vertical',
    RightVertical = 'right-vertical',
    TopHorizontal = 'top-horizontal',
    BottomHorizontal = 'bottom-horizontal',
    None = 'none'
}


export type ClosestEdge = [number, EdgeType, GuidSizePosition | null, number];



export const MAP_EDGE_TYPE_TO_MAGNET: { [key: string]: MagnetCornerType } = {
    [EdgeType.LeftVertical]: MagnetCornerType.Left_Vertical,
    [EdgeType.RightVertical]: MagnetCornerType.Right_Vertical,
    [EdgeType.TopHorizontal]: MagnetCornerType.Top_Horizontal,
    [EdgeType.BottomHorizontal]: MagnetCornerType.Bottom_Horizontal,
}


export const MAP_MAGNET_TYPE_TO_EDGE: { [key: string]: EdgeType } = {
    [MagnetCornerType.Left_Vertical]: EdgeType.LeftVertical,
    [MagnetCornerType.Right_Vertical]: EdgeType.RightVertical,
    [MagnetCornerType.Top_Horizontal]: EdgeType.TopHorizontal,
    [MagnetCornerType.Bottom_Horizontal]: EdgeType.BottomHorizontal,
}

const calcIntersection = (p1: number, p2: number, np1: number, np2: number) => {
    const dp1 = Math.abs(p1 - np1);
    const dp2 = Math.abs(p2 - np2);
    const dp3 = Math.abs(p1 - np2);
    const dp4 = Math.abs(p2 - np1);
    const maxDelta = (
        (p1 < np1 && p2 > np2)
        || (p1 > np1 && p1 < np2 && p2 < np2 && p2 > np1)
        || (p1 < np1 && p2 > np1 && p2 < np2)
        || (p1 > np1 && p1 < np2 && p2 > np2)
    ) ? 0 : Math.min(dp1, dp2, dp3, dp4);
    return maxDelta;
};

/**
 * Method for gettings closest edge between two blocks
 * @param CAPTURE_DELTA distance for capturing
 * @param currentPoints current block corner points
 * @param position position of another block 
 * @param size size of another block
 * @returns [distance, EdgeType, min distance to another edges] tuple array
 */
const getClosestEdge = (CAPTURE_DELTA: number, currentPoints: Quadro<Position>, [x, y]: Position, [sx, sy]: Position, el: any): [number, EdgeType, number][] => {

    const [c1, c2, c3] = currentPoints; // top-left     top-right   bottom-right    bottom-left (ignored)

    // select only one edge for magneting!
    let resultDelta = -1;
    let closestEdge: [number, EdgeType, number][] = [];

    const dLeftVertical = Math.abs(c2[0] - x);
    const dRightVertical = Math.abs(c2[0] - x - sx);

    const dTopHorizontal = Math.abs(c3[1] - y);
    const dBottomHorizontal = Math.abs(c3[1] - y - sy);

    let maxDelta = -1;


    if (dLeftVertical > -1 && CAPTURE_DELTA > dLeftVertical) {

        maxDelta = calcIntersection(c2[1], c3[1], y, y + sy);

        if (maxDelta > -1 && maxDelta < CAPTURE_DELTA) {
            resultDelta = dLeftVertical;
            closestEdge = [[dLeftVertical, EdgeType.LeftVertical, maxDelta]];
            // closestEdge.push([dLeftVertical, EdgeType.LeftVertical, maxDelta]);
        }
    }

    if (dRightVertical > -1 && CAPTURE_DELTA > dRightVertical && (dRightVertical < resultDelta || resultDelta < 0)) {

        maxDelta = calcIntersection(c2[1], c3[1], y, y + sy);

        if (maxDelta > -1 && maxDelta < CAPTURE_DELTA) {
            resultDelta = dRightVertical;
            closestEdge = [[dRightVertical, EdgeType.RightVertical, maxDelta]];
        }
    }
    if (dTopHorizontal > -1 && CAPTURE_DELTA > dTopHorizontal && (dTopHorizontal < resultDelta || resultDelta < 0)) {

        maxDelta = calcIntersection(c1[0], c2[0], x, x + sx);

        if (maxDelta > -1 && maxDelta < CAPTURE_DELTA) {
            resultDelta = dTopHorizontal;
            closestEdge = [[dTopHorizontal, EdgeType.TopHorizontal, maxDelta]];
        }
    }
    if (dBottomHorizontal > -1 && CAPTURE_DELTA > dBottomHorizontal && (dBottomHorizontal < resultDelta || resultDelta < 0)) {

        maxDelta = calcIntersection(c1[0], c2[0], x, x + sx);

        if (maxDelta > -1 && maxDelta < CAPTURE_DELTA) {
            resultDelta = dBottomHorizontal;
            closestEdge = [[dBottomHorizontal, EdgeType.BottomHorizontal, maxDelta]];
        }
    }

    return [...closestEdge];
};


export type ItemData = { position: Position, size: Position };

/**
 * reducing iterating function (returns item with closest edge and distance)
 * @param CAPTURE_DELTA distance for capturing
 * @param currentPoints current block corner points
 * @returns iterating function for reducer over items (memo as [distance, edgeType, renewing_memo_status])
 */
export const getClosestEdgeDistanceReducer = <T extends ItemData>(CAPTURE_DELTA: number, currentPoints: Quadro<Position>) => {
    return (_memo: any, el: T, i?: number): [number, EdgeType, number][] => {
        const data = getClosestEdge(CAPTURE_DELTA, currentPoints, el.position, el.size, el);
        return [...data];
    };
};

export const getResultSize = (items: Array<[EdgeType, Position]>): Position => {
    return items.reduce(
        (memo, [edgeType, [sx, sy]]) => {
            const resSx = edgeType === EdgeType.LeftVertical || edgeType === EdgeType.RightVertical ? sx : memo[0];
            const resSy = edgeType === EdgeType.TopHorizontal || edgeType === EdgeType.BottomHorizontal ? sy : memo[1];
            return [resSx, resSy];
        },
        [-1, -1] as Position
    );
};

type MagnetingEdgesResult = (distance: number, current: GuidSizePosition, closestEdge: [number, EdgeType, GuidSizePosition, number]) => NearestResult[];


export const nearestCalculation = (closestEdges: ClosestEdge[], magnetingEdges: MagnetingEdgesResult) =>

    (_guid: GuidType, _mouseContext: IContextMagnet, startGuidSizePosition: GuidSizePosition) =>

        (nearestYes: (_items: [NearestResult[], NearestResult[]]) => void, nearestNo: () => void) => {

            const nearestData = closestEdges.reduce<[[NearestResult[], NearestResult[]], [number, number]]>(

                ([[vertResult, horResult], minDistances], [distance, edgeType, closestItem, minDistanceToAnotherEdge], i) => {

                    if (edgeType !== EdgeType.None && closestItem) {

                        let isClosestExist = -1;

                        let minVertical = minDistances[0];
                        let minHorizontal = minDistances[1];

                        if (edgeType === EdgeType.LeftVertical || edgeType === EdgeType.RightVertical) {
                            if ((minVertical > distance) || minVertical < 0) {
                                minVertical = distance;
                                isClosestExist = 0;
                            }
                        }
                        if (edgeType === EdgeType.TopHorizontal || edgeType === EdgeType.BottomHorizontal) {
                            if ((minHorizontal > distance) || minHorizontal < 0) {
                                minHorizontal = distance;
                                isClosestExist = 1;
                            }
                        }

                        if (isClosestExist > -1) {
                            const newNearest = magnetingEdges(distance, startGuidSizePosition, [distance, edgeType, closestItem, minDistanceToAnotherEdge]);
                            console.log('%c new nearest: >', 'color: yellow; background-color: #345; border: 1px solid orange;', distance, edgeType, closestItem);
                            return isClosestExist === 0
                                ? [[newNearest, horResult], [minVertical, minHorizontal]]
                                : [[vertResult, newNearest], [minVertical, minHorizontal]];

                        }
                    }

                    return [[vertResult, horResult], minDistances];
                },
                [[[], []], [-1, -1]] as [[NearestResult[], NearestResult[]], [number, number]]
            );

            const nearestVerticalHorizontal = nearestData[0];
            const nearest: [NearestResult[], NearestResult[]] = [nearestVerticalHorizontal[0], nearestVerticalHorizontal[1]];

            if ((!nearest[0].length && !nearest[1].length)) {
                nearestNo();
            } else {

                nearestYes(nearest);
            }

        }
