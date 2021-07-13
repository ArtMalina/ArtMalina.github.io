import React, { useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { filter } from 'rxjs/operators';

import {
    GuidType,
    Position,
    MagnetCornerType,
    BoxProps,
    Nullable,
    NearestFrame,
    MagnetMarkerPosition,
    IMagnetPair,
    MagnetPairDirection,
    IMagnetPairIn,
    ComponentWrapper,
    MagnetFrameProps,
    MagnetCornerProps,
    IObservablesDrag,
    IObservableControl,
} from '@designer-core/shared/types';
import { BehaviorSubject } from 'rxjs';
import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { MsgSelector, useStorage, MsgService } from '@designer-core/shared/helpers/storage';
import { IContextMagnet } from './context';
import { IContextResizer } from '../resizable';

import { nearestCalculation, getClosestEdgeDistanceReducer, EdgeType, getResultSize, MAP_EDGE_TYPE_TO_MAGNET, MAP_MAGNET_TYPE_TO_EDGE } from './nearestEdges';

import { Indents, GuidSizePosition, NearestResult, CornerData, ClosestData } from './types';


const DETAIL_MAGNET_TYPES: Array<[MagnetCornerType, number, MagnetCornerType]> = [
    [MagnetCornerType.TopLeft, 1, MagnetCornerType.TopLeft_LeftBottom],
    [MagnetCornerType.TopLeft, 2, MagnetCornerType.TopLeft_LeftTop],
    [MagnetCornerType.TopLeft, 3, MagnetCornerType.TopLeft_TopLeft],
    [MagnetCornerType.TopLeft, 4, MagnetCornerType.TopLeft_TopRight],

    [MagnetCornerType.TopRight, 5, MagnetCornerType.TopRight_TopLeft],
    [MagnetCornerType.TopRight, 6, MagnetCornerType.TopRight_TopRight],
    [MagnetCornerType.TopRight, 7, MagnetCornerType.TopRight_RightTop],
    [MagnetCornerType.TopRight, 8, MagnetCornerType.TopRight_RightBottom],

    [MagnetCornerType.BottomRight, 9, MagnetCornerType.BottomRight_RightTop],
    [MagnetCornerType.BottomRight, 10, MagnetCornerType.BottomRight_RightBottom],
    [MagnetCornerType.BottomRight, 11, MagnetCornerType.BottomRight_BottomRight],
    [MagnetCornerType.BottomRight, 12, MagnetCornerType.BottomRight_BottomLeft],

    [MagnetCornerType.BottomLeft, 13, MagnetCornerType.BottomLeft_BottomRight],
    [MagnetCornerType.BottomLeft, 14, MagnetCornerType.BottomLeft_BottomLeft],
    [MagnetCornerType.BottomLeft, 15, MagnetCornerType.BottomLeft_LeftBottom],
    [MagnetCornerType.BottomLeft, 16, MagnetCornerType.BottomLeft_LeftTop],
];

const getDetailMagnetType = (magnetType: MagnetCornerType, direction: number): MagnetCornerType => {
    const detail = DETAIL_MAGNET_TYPES.find(([_magnetType, _direction, _resultMagnetType]) => magnetType === _magnetType && direction === _direction);
    return detail ? detail[2] : MagnetCornerType.None;
};



const MagnetAllEdges = (CAPTURE_DELTA: number, [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT]: Indents) => {

    return (distance: number, current: GuidSizePosition, closestEdge: [number, EdgeType, GuidSizePosition, number]): NearestResult[] => {
        const [x, y] = current.position;
        const [sx, sy] = current.size;
        const [edgeDistance, edgeType, itemGuidSizePos, minDistanceToAnotherEdge] = closestEdge;

        const MIN_WIDTH = 50, MIN_HEIGHT = 50;

        console.log('minDistanceToAnotherEdge', minDistanceToAnotherEdge, itemGuidSizePos.guid);

        if (edgeDistance < CAPTURE_DELTA && minDistanceToAnotherEdge < CAPTURE_DELTA) {

            let [resultSx, resultSy] = [sx, sy];

            const { position: [itemX, itemY], size: [itemSx, itemSy] } = itemGuidSizePos;

            const [dx, dy] = [itemX - x, itemY - y];

            switch (edgeType) {
                case EdgeType.LeftVertical:
                    [resultSx, resultSy] = dx > MIN_WIDTH ? [dx, sy] : [sx, sy];
                    break;
                case EdgeType.RightVertical:
                    [resultSx, resultSy] = dx + itemSx > MIN_WIDTH ? [dx + itemSx, sy] : [sx, sy];
                    break;
                case EdgeType.TopHorizontal:
                    [resultSx, resultSy] = dy > MIN_HEIGHT ? [sx, dy] : [sx, sy];
                    break;
                case EdgeType.BottomHorizontal:
                    [resultSx, resultSy] = dy + itemSy > MIN_HEIGHT ? [sx, dy + itemSy] : [sx, sy];
                    break;
                default:
                    [resultSx, resultSy] = [sx, sy];
            }

            return [
                [itemGuidSizePos.guid, [resultSx, resultSy], itemGuidSizePos.size, MAP_EDGE_TYPE_TO_MAGNET[edgeType] || MagnetCornerType.None]
            ];
        }

        return [];
    };
};


const MagnetAllCorners = (CAPTURE_DELTA: number, [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT]: Indents) =>
    (distance: number, currentCorner: CornerData, closestCorner: CornerData, resultMagnetType: MagnetCornerType): NearestResult[] => {

        const closestCornerType = closestCorner[0];

        const [csx, csy] = currentCorner[1].size;
        const currentCornerType = currentCorner[0];

        const { guid, position: [x, y], size: [sx, sy] } = closestCorner[1];
        const { position: [cx, cy] } = currentCorner[1];

        if (distance > CAPTURE_DELTA) return [];
        if (closestCornerType === currentCornerType) return [];

        let result: NearestResult[] = [];

        let leftRight = [MagnetCornerType.TopLeft, MagnetCornerType.BottomLeft].indexOf(closestCornerType) > -1 ? 1 : 0;
        let topBottom = [MagnetCornerType.TopLeft, MagnetCornerType.TopRight].indexOf(closestCornerType) > -1 ? 1 : 0;

        const leftRightPoint = x - leftRight * LEFT_INDENT + (1 - leftRight) * RIGHT_INDENT,
            topBottomPoint = y - topBottom * TOP_INDENT + (1 - topBottom) * BOTTOM_INDENT;

        let distLeftRightPoint = (leftRightPoint - cx) * (leftRightPoint - cx) + (y - cy) * (y - cy);
        let distTopBottomPoint = (x - cx) * (x - cx) + (topBottomPoint - cy) * (topBottomPoint - cy);

        // console.log('all-lefts/rights-->', Math.sqrt(distLeftRightPoint), distance, [leftRightPoint, y], [x, y]);
        // console.log('all-tops/bottoms-->', Math.sqrt(distTopBottomPoint), distance, [x, topBottomPoint], [x, y]);

        // let tempX = 0;
        let tempY = 0;

        let closeToLeftRight = 1;

        if (distLeftRightPoint < distTopBottomPoint) {
            // left/right-point
            tempY = y;
        } else {
            // top/bottom-point
            tempY = topBottomPoint;
            closeToLeftRight = 0;
        }

        let resX = 0, resY = 0, magnetType = closestCornerType;
        let magnetDirection = 0;

        switch (currentCornerType) {
            case MagnetCornerType.TopRight:
                magnetDirection = topBottom ? 1 : 15;
                magnetDirection = !topBottom && !closeToLeftRight ? (1 - leftRight) * 12 + leftRight * 14 : magnetDirection;
                [resX, resY] = topBottom
                    ? [leftRightPoint - leftRight * csx, y]
                    : [closeToLeftRight * leftRightPoint + (1 - closeToLeftRight) * x - csx, tempY];
                magnetType = getDetailMagnetType(closestCornerType, magnetDirection);
                result = magnetType !== MagnetCornerType.None ? [
                    [guid, [resX, resY], [sx, sy], magnetType]
                ] : [];
                break;

            case MagnetCornerType.TopLeft:
                magnetDirection = topBottom ? 8 : 10;
                magnetDirection = !topBottom && !closeToLeftRight ? (1 - leftRight) * 11 + leftRight * 13 : magnetDirection;
                [resX, resY] = [8, 10].indexOf(magnetDirection) > -1
                    ? [leftRightPoint, y]
                    : [x, topBottomPoint];
                magnetType = getDetailMagnetType(closestCornerType, magnetDirection);
                result = magnetType !== MagnetCornerType.None ? [
                    [guid, [resX, resY], [sx, sy], magnetType]
                ] : [];
                break;


            case MagnetCornerType.BottomRight:
                magnetDirection = closeToLeftRight ? 16 * (1 - topBottom) + 2 * topBottom : 5 * (1 - leftRight) + 3 * leftRight;
                [resX, resY] = closeToLeftRight
                    ? [leftRightPoint - csx, y - csy]
                    : [x - csx, topBottomPoint - csy];
                magnetType = getDetailMagnetType(closestCornerType, magnetDirection);
                result = magnetType !== MagnetCornerType.None ? [
                    [guid, [resX, resY], [sx, sy], magnetType]
                ] : [];
                break;


            case MagnetCornerType.BottomLeft:
                magnetDirection = closeToLeftRight ? 9 * (1 - topBottom) + 7 * topBottom : 6 * (1 - leftRight) + 4 * leftRight;
                [resX, resY] = closeToLeftRight
                    ? [leftRightPoint, y - csy]
                    : [x, topBottomPoint - csy];
                magnetType = getDetailMagnetType(closestCornerType, magnetDirection);
                result = magnetType !== MagnetCornerType.None ? [
                    [guid, [resX, resY], [sx, sy], magnetType]
                ] : [];
                break;


            default:
        }

        return [...result];
    };



const getClosestEdges = (CAPTURE_DELTA: number, [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT]: Indents) =>
    (currentPoints: Array<Position>, otherItems: GuidSizePosition[]): Array<[number, EdgeType, GuidSizePosition | null, number]> => {
        const reducerFn = getClosestEdgeDistanceReducer(CAPTURE_DELTA, [currentPoints[0], currentPoints[1], currentPoints[2], currentPoints[3]]);
        const res = otherItems.reduce(
            (_memo, el, index): Array<[number, EdgeType, GuidSizePosition | null, number]> => {
                const data = reducerFn(_memo, el);
                // const  [distance, edgeTpye, minDistToAnotherEdge, status] = reducerFn(_memo, el);
                const res = data.map(
                    ([distance, edgeTpye, minDistToAnotherEdge]) =>
                        [distance, edgeTpye, el, minDistToAnotherEdge] as [number, EdgeType, GuidSizePosition | null, number]
                );
                return data.length ? [..._memo, ...res] : _memo;
                // return status ? [..._memo, [distance, edgeTpye, el, minDistToAnotherEdge]] : _memo;
            },
            [] as Array<[number, EdgeType, GuidSizePosition | null, number]>
        );
        return res; //[-1, null, null, MagnetCornerType.None];
    };

const getClosestPointDistance = (currentPoints: Array<Position | null>, current: GuidSizePosition, item: GuidSizePosition): ClosestData => {
    const { position: [x, y], size: [sx, sy] } = item;
    // const { position: [cx, cy], size: [scx, scy] } = current;
    const corners: [Position, Position, Position, Position] = [
        [x, y], [x + sx, y],
        [x + sx, y + sy], [x, y + sy],
    ];
    // const currentPoints: [Position, Position, Position, Position] = [
    //     [cx, cy], [cx + scx, cy],
    //     [cx + scx, cy + scy], [cx, cy + scy],
    // ];
    const [_distance, _currentCorner, _closestCorner, _cornerSubType] = corners.reduce<ClosestData>(
        (memo, [px, py], i) => {

            let cornerType = [MagnetCornerType.TopLeft, MagnetCornerType.TopRight, MagnetCornerType.BottomRight, MagnetCornerType.BottomLeft][i];

            const [distance, position, currentCornerType] =
                currentPoints.reduce<[number, Position, MagnetCornerType]>(
                    (currMemo, crn, j) => {
                        const [cpx, cpy] = crn || [0, 0];
                        const [dx, dy] = [px - cpx, py - cpy];
                        const ndist = dx * dx + dy * dy;
                        let currentCornerType = [MagnetCornerType.TopLeft, MagnetCornerType.TopRight, MagnetCornerType.BottomRight, MagnetCornerType.BottomLeft][j];
                        return crn && (currMemo[0] > ndist || currMemo[0] < 0) ? [ndist, [cpx, cpy], currentCornerType] : currMemo;
                    },
                    [-1, [0, 0] as Position, MagnetCornerType.None]

                );
            const closestCorner: CornerData = [cornerType, { ...item, position: [px, py] }];
            const currentCorner: CornerData = [currentCornerType, { ...current, position: [position[0], position[1]] }];
            return memo[0] > distance || memo[0] < 0 ? [distance, { ...currentCorner }, { ...closestCorner }, cornerType] : memo;
        },
        [-1, null, null, MagnetCornerType.None]
    );

    return [Math.round(Math.sqrt(_distance)), _currentCorner, _closestCorner, _cornerSubType];
};

const COMPOSE_CORNER_TYPES: { [id: string]: { [sid: string]: MagnetCornerType } } = {

    [MagnetCornerType.TopLeft]: {
        [MagnetCornerType.TopLeft]: MagnetCornerType.None,
        [MagnetCornerType.TopRight]: MagnetCornerType.LeftTop,
        [MagnetCornerType.BottomRight]: MagnetCornerType.TopLeft,
        [MagnetCornerType.BottomLeft]: MagnetCornerType.TopLeft,
        // [MagnetCornerType.BottomRight]: MagnetCornerType.TopLeft,    1st corner - TOp-LEFT, 2d - BOTTOM-LEFT  => NEWTYPE [TOP-LEFT-LEFT]
    },
    [MagnetCornerType.TopRight]: {
        [MagnetCornerType.TopLeft]: MagnetCornerType.RightTop,
        [MagnetCornerType.TopRight]: MagnetCornerType.None,
        [MagnetCornerType.BottomRight]: MagnetCornerType.TopRight,
        [MagnetCornerType.BottomLeft]: MagnetCornerType.RightTop,
    },
    [MagnetCornerType.BottomLeft]: {
        [MagnetCornerType.TopLeft]: MagnetCornerType.BottomLeft,
        [MagnetCornerType.TopRight]: MagnetCornerType.LeftBottom,
        [MagnetCornerType.BottomRight]: MagnetCornerType.LeftBottom,
        [MagnetCornerType.BottomLeft]: MagnetCornerType.None,
    },
    [MagnetCornerType.BottomRight]: {
        [MagnetCornerType.TopLeft]: MagnetCornerType.RightBottom,
        [MagnetCornerType.TopRight]: MagnetCornerType.BottomRight,
        [MagnetCornerType.BottomRight]: MagnetCornerType.None,
        [MagnetCornerType.BottomLeft]: MagnetCornerType.RightBottom,
    },
};


const getClosestItem = (currentGuid: GuidType, currentPoints: Array<Position | null>, current: GuidSizePosition, items: GuidSizePosition[]): ClosestData => {
    return items
        .filter(({ guid }) => guid !== currentGuid)
        .reduce<ClosestData>(
            (memo, item) => {
                const [distance, currentCorner, closestCorner, cornerType] = getClosestPointDistance(currentPoints, current, item);
                const currentCornerType = currentCorner ? currentCorner[0] : MagnetCornerType.None;
                let resMagnetType = COMPOSE_CORNER_TYPES[cornerType] && COMPOSE_CORNER_TYPES[cornerType][currentCornerType];
                return memo[0] > distance || memo[0] < 0 ? [distance, currentCorner, closestCorner, resMagnetType || MagnetCornerType.None] : memo;
            },
            [-1, null, null, MagnetCornerType.None]
        );
};


const getMagnetWrapComponent = <TProps extends BoxProps>(
    MagnetWrapper: ComponentWrapper<TProps, TProps & MagnetFrameProps & MagnetCornerProps>,
    { CAPTURE_DELTA, Indents }: { CAPTURE_DELTA: number, Indents: Indents }
) => <TContext extends IContextMagnet & IObservablesDrag & IObservableControl & IContextResizer>(
    MouseStreamContext: React.Context<Nullable<TContext>>
) =>

        (Component: React.ComponentType<TProps>, services: MsgService<IState, any>[], selectors: MsgSelector<IState, any, any>[]) => {

            const MagnetBlock = MagnetWrapper(Component);

            const ResultComponent = (props: React.PropsWithChildren<TProps>) => {

                const { guid, xy$, size$ } = props;

                const storage = useStorage(`magnetable: ${guid}`, services, selectors);

                const markerRef = useRef<Nullable<[Position, MagnetCornerType]>>(null);

                const sizeMarker$ = useMemo(() => new BehaviorSubject<[NearestResult | null, NearestResult | null]>([null, null]), []);

                const mouseContext = useContext(MouseStreamContext) as TContext;

                const markerPosition$ = useMemo<BehaviorSubject<Nullable<MagnetMarkerPosition>>>(
                    () => new BehaviorSubject<Nullable<MagnetMarkerPosition>>(null), []
                );

                const nearestFrame$ = useMemo<BehaviorSubject<Nullable<NearestFrame>>>(
                    () => new BehaviorSubject<Nullable<NearestFrame>>(null), []
                );


                // init clear nearestFrame (corner and edge markers) by stopping
                useEffect(() => {

                    console.log('%c storage--> init_magnetable 1: ', 'color: green; background-color: yellow;', guid);

                    const magnetOutDrag = mouseContext.dragStop.pipe(
                        filter(({ elementId }) => elementId !== guid)
                    ).subscribe(({ elementId }) => {
                        const nearestFrame = nearestFrame$.getValue();
                        if (nearestFrame && nearestFrame.magneted === elementId) {
                            nearestFrame$.next(null);
                        }
                    });

                    const magnetOutResize = mouseContext.resizeStop.pipe(
                        filter(({ elementId }) => elementId !== guid)
                    ).subscribe(({ elementId }) => {
                        const nearestFrame = nearestFrame$.getValue();
                        if (nearestFrame && nearestFrame.magneted === elementId) {
                            nearestFrame$.next(null);
                        }
                    });

                    return () => {
                        magnetOutDrag.unsubscribe();
                        magnetOutResize.unsubscribe();
                    }
                }, [guid, mouseContext, nearestFrame$]);

                // magnet to Current (we need to show magnet frame border)
                useEffect(() => {

                    console.log('%c storage--> init_magnetable 2: ', 'color: green; background-color: yellow;', guid);

                    const magnetInSubscription = mouseContext.magneting.pipe(
                        filter(
                            (data: IMagnetPair) => {
                                const isIn = data.direction === MagnetPairDirection.In;
                                return isIn && guid === data.items[0];
                            }
                        )
                    ).subscribe((data: IMagnetPair) => {
                        const type = (data as IMagnetPairIn).type;
                        const items = (data as IMagnetPairIn).items;
                        const xy = xy$.getValue();
                        const sxy = size$.getValue();
                        const nearestFrame: NearestFrame = {
                            frame: [[xy[0], xy[1]], [sxy[0], sxy[1]]],
                            magnetType: type,
                            magneted: items[1],
                            fix: guid
                        };
                        nearestFrame$.next({ ...nearestFrame });
                    });

                    return () => {
                        magnetInSubscription.unsubscribe();
                    }

                }, [guid, mouseContext, xy$, size$, nearestFrame$]);


                const dragForNearests = useCallback((nearestYes, nearestNo, currentPoints: Array<Position | null>) => {

                    let [currx, curry] = xy$.getValue();
                    let [currSx, currSy] = size$.getValue()

                    const startGuidSizePosition: GuidSizePosition = { guid, position: [currx, curry], size: [currSx, currSy] };

                    const controls = storage.get<string, IControlData[]>('controls') as IControlData[];
                    const _items = controls
                        .filter(t => t.guid !== guid)
                        .map(({ guid: _guid, position, size }) => ({ guid: _guid, position, size }));


                    const nearest: NearestResult[] = [];

                    const [distance, currentCorner, closestCorner, resultMagnetType] = getClosestItem(guid, currentPoints, startGuidSizePosition, _items);
                    if (currentCorner && closestCorner) {
                        nearest.push(
                            ...MagnetAllCorners(CAPTURE_DELTA, Indents)(distance, currentCorner, closestCorner, resultMagnetType)
                        );
                    }

                    if (!nearest.length && !!markerRef.current) {
                        mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [guid] });
                        nearestNo();
                    }

                    nearestYes(nearest);

                }, [guid, mouseContext, size$, xy$, storage]);


                const nearestEdgesByResizing = useCallback((nearestYes: any, nearestNo: any, currentPoints: Array<Position>) => {

                    let [currx, curry] = xy$.getValue();
                    let [currSx, currSy] = size$.getValue()

                    const startGuidSizePosition: GuidSizePosition = { guid, position: [currx, curry], size: [currSx, currSy] };

                    const controls = storage.get<string, IControlData[]>('controls') as IControlData[];
                    const _items = controls
                        .filter(t => t.guid !== guid)
                        .map(({ guid: _guid, position, size }) => ({ guid: _guid, position, size }));


                    const closestEdges = getClosestEdges(
                        CAPTURE_DELTA, Indents
                    )(currentPoints, _items);

                    const magnetingEdges = MagnetAllEdges(CAPTURE_DELTA, Indents);

                    return nearestCalculation(closestEdges, magnetingEdges)(guid, mouseContext, startGuidSizePosition)(nearestYes, nearestNo);

                }, [guid, mouseContext, storage, xy$, size$]);

                useEffect(() => {

                    console.log('%c \nstart subs nearest >\n', 'background-color: #111; color: white; border: 1px solid orange;');

                    const magnetSubscription = mouseContext.magneting.pipe(
                        filter(
                            (data: IMagnetPair) => {
                                const isOut = data.direction === MagnetPairDirection.Out;
                                const magneted = mouseContext.magneted.getValue();
                                const isCurrentOut = isOut && !!magneted.filter(t => t.magneted.includes(guid)).length;
                                isOut && console.log('%c outing-item --->', 'color: yellow; background-color: black; border: orange;', isCurrentOut, guid, magneted, data);
                                return isCurrentOut;
                            }
                        )
                    ).subscribe((data: IMagnetPair) => {
                        console.log('---\n\n outing-item MAGNETING_SUB->', data, guid, nearestFrame$.getValue(), markerPosition$.getValue());
                        markerRef.current = null;
                        nearestFrame$.next(null);
                        markerPosition$.next(null);
                    });



                    const dragStopSubscription = mouseContext.dragStop.pipe(
                        filter(({ elementId }) => elementId === guid)
                    ).subscribe(_ => {
                        console.log('stop listening ->', guid, markerRef.current, mouseContext.group.getValue());
                        if (markerRef.current) {
                            const [[markerX, markerY]] = markerRef.current;
                            markerRef.current = null;
                            nearestFrame$.next(null);

                            // mouseContext.group.getValue().forEach((id) => id === guid && storage.send('position', [id, [markerX, markerY]]));
                            storage.send('position', [guid, [markerX, markerY]]);

                            markerPosition$.next([[markerX, markerY], 1]);
                        }
                    });

                    const dragStartSubscription = mouseContext.dragStart.pipe(
                        filter(({ elementId }) => elementId === guid)
                    ).subscribe(_ => {
                        // we have to OUT all of chained items (not just first and second)
                        // may be we should clear all magneted items because of new MOVING!
                        mouseContext.magnetingStart.next(guid);
                        mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [guid] });
                    });


                    const dragSubscription = mouseContext.drag.pipe(
                        filter(
                            ({ elementId }) =>
                                elementId === guid
                                && mouseContext.group.getValue().findIndex(tGuid => tGuid === elementId) < 0
                        )
                    ).subscribe(_ => {


                        let [currx, curry] = xy$.getValue();
                        let [currSx, currSy] = size$.getValue();

                        const currentPoints: Position[] = [
                            [currx, curry], [currx + currSx, curry],
                            [currx + currSx, curry + currSy], [currx, curry + currSy],
                        ];

                        dragForNearests(
                            // nearest is here!
                            (nearest: NearestResult[]) => {
                                nearest.forEach(([nearestGuid, magnetPosition, _nearSize, magnetType]) => {

                                    if (!markerRef.current || markerRef.current[1] !== magnetType) {

                                        // clear previous 
                                        !!mouseContext.magneted.getValue().length
                                            && mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [guid] });

                                        mouseContext.magneting.next({ direction: MagnetPairDirection.In, items: [nearestGuid, guid], type: magnetType });
                                        markerRef.current = [[magnetPosition[0], magnetPosition[1]], magnetType];
                                        markerPosition$.next([[magnetPosition[0], magnetPosition[1]], 0]);
                                    }
                                });
                            },
                            // nearest is out here!
                            () => {
                                markerRef.current = null;
                                nearestFrame$.next(null);
                                markerPosition$.next(null);
                            },
                            currentPoints
                        );
                    });


                    const resizeStartSubscription = mouseContext.resizeStart.pipe(
                        filter(({ elementId }) => elementId === guid)
                    ).subscribe(_ => {
                        mouseContext.magnetingStart.next(guid);
                        mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [guid] });
                    });

                    const resizeStopSubscription = mouseContext.resizeStop.pipe(
                        filter(({ elementId }) => elementId === guid)
                    ).subscribe(_ => {

                        const [nearestVertical, nearestHorizontal] = sizeMarker$.getValue();

                        console.log('resizing stop! ->', guid, nearestVertical, nearestHorizontal);

                        if (nearestVertical || nearestHorizontal) {

                            const currSize = size$.getValue();

                            const resItems: [EdgeType, Position][] = [nearestVertical, nearestHorizontal].map((nearest) => {
                                return nearest
                                    ? [MAP_MAGNET_TYPE_TO_EDGE[nearest[3]] || EdgeType.None, nearest[1]]
                                    : [EdgeType.None, [-1, -1]];
                            });

                            const [calcSx, calcSy] = getResultSize(resItems);

                            const resSx = calcSx > -1 ? calcSx : currSize[0];
                            const resSy = calcSy > -1 ? calcSy : currSize[1];

                            size$.next([resSx, resSy]);
                            storage.send('size', [guid, [resSx, resSy]]);

                            sizeMarker$.next([null, null]);
                            nearestFrame$.next(null);
                            markerPosition$.next(null);
                        }
                    });

                    const resizeSubscription = mouseContext.resize.pipe(
                        filter(([elementId]) => elementId === guid)
                    ).subscribe(([_elementId]) => {

                        let [currx, curry] = xy$.getValue();
                        let [currSx, currSy] = size$.getValue();

                        const currentPoints: Array<Position> = [
                            [currx, curry],
                            [currx + currSx, curry],
                            [currx + currSx, curry + currSy],
                            [currx, curry + currSy],
                        ];

                        // TODO: refqctor to BehaviorSubject usage!
                        nearestEdgesByResizing(
                            // nearest is here!
                            (nearest: [NearestResult[], NearestResult[]]) => {
                                const [prevVertical, prevHorizontal] = sizeMarker$.getValue();

                                const [nearestVertical, nearestHorizontal] = nearest;
                                let resultVert = prevVertical, resultHor = prevHorizontal;

                                let newVertHoriz = 0;   // 0 - no updates, 1 - only vert  2 - vert & hor  3 - only hor

                                // isNewVert - compare previous vertical edge with new nearest vertical edge
                                const isNewVert = prevVertical
                                    && !!nearestVertical.filter(
                                        ([itemGuid, _size, _pos, type]) =>
                                            (itemGuid === prevVertical[0] && type !== prevVertical[3]) || itemGuid !== prevVertical[0]
                                    ).length;

                                isNewVert && console.log('isNewVert', isNewVert, [prevVertical, prevHorizontal], [nearestVertical && nearestVertical[0], nearestHorizontal && nearestHorizontal[0]]);

                                // check: new edge (nearest exist, prev - not) exiting edge (prev edge is exist, nearest - not) changed edge (isNewVert)
                                if ((prevVertical && !nearestVertical.length) || (!prevVertical && nearestVertical.length) || isNewVert) {
                                    newVertHoriz = 1;
                                    resultVert = nearestVertical[0];
                                }

                                const isNewHor = prevHorizontal
                                    && !!nearestHorizontal.filter(
                                        ([itemGuid, _size, _pos, type]) =>
                                            (itemGuid === prevHorizontal[0] && type !== prevHorizontal[3]) || itemGuid !== prevHorizontal[0]
                                    ).length;

                                if ((prevHorizontal && !nearestHorizontal.length) || (!prevHorizontal && nearestHorizontal.length) || isNewHor) {
                                    newVertHoriz = 3 - newVertHoriz;
                                    resultHor = nearestHorizontal[0];
                                }

                                if (newVertHoriz) {

                                    sizeMarker$.next([resultVert || null, resultHor || null]);

                                    if (resultVert || resultHor) {

                                        if (prevVertical || prevHorizontal) {
                                            mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [guid] });
                                        }

                                        const resItems = [resultVert, resultHor].filter(t => !!t) as NearestResult[];
                                        let nearestGuids: [GuidType, MagnetCornerType][] = resItems.reduce<[GuidType, MagnetCornerType][]>(
                                            (memo, [_guid, _s, _p, _type]) => {
                                                const isExist = memo.findIndex(([_mg, _mtype]) => _mg === _guid && _mtype === _type) > -1;
                                                return !isExist ? [...memo, [_guid, _type]] : [...memo];
                                            },
                                            []
                                        );

                                        nearestGuids.forEach(
                                            ([nearestGuid, magnetType]) =>
                                                mouseContext.magneting.next({ direction: MagnetPairDirection.In, items: [nearestGuid, guid], type: magnetType })
                                        );

                                        markerPosition$.next([[-1, -1], 0]);

                                    }

                                }

                            },
                            // nearest is out here! (for every sizing step changing)
                            () => {

                                const [vert, horiz] = sizeMarker$.getValue();

                                if (vert || horiz) {

                                    const uniueOutingGuids = vert ? [vert[0]] : [];
                                    horiz && !uniueOutingGuids.filter(t => t && t[0] === horiz[0]).length && uniueOutingGuids.push(horiz[0]);
                                    uniueOutingGuids.forEach(_g => mouseContext.magneting.next({ direction: MagnetPairDirection.Out, items: [_g] }));

                                    markerRef.current = null;
                                    nearestFrame$.next(null);
                                    sizeMarker$.next([null, null]);
                                    markerPosition$.next(null);
                                }
                            },
                            currentPoints
                        );


                    });

                    return () => {
                        magnetSubscription.unsubscribe();

                        dragSubscription.unsubscribe();
                        dragStartSubscription.unsubscribe();
                        dragStopSubscription.unsubscribe();

                        resizeSubscription.unsubscribe();
                        resizeStartSubscription.unsubscribe();
                        resizeStopSubscription.unsubscribe();

                    };

                }, [guid, mouseContext, storage, xy$, size$, markerPosition$, nearestFrame$, markerRef, sizeMarker$, nearestEdgesByResizing, dragForNearests]);

                return (
                    <MagnetBlock
                        { ...props }
                        markerPosition$={ markerPosition$ }
                        nearestFrame$={ nearestFrame$ }
                    >
                        { props.children }
                    </MagnetBlock>
                );
            };

            return ResultComponent;
        };

export default getMagnetWrapComponent;
