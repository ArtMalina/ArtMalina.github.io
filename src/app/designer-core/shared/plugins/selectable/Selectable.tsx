import React, { useRef, useState, useContext, useEffect, useMemo } from 'react';
import {
    SELECTING_FRAME_GUID,
    GuidType,
    Position,
    BoxProps,
    DragFrameProps,
    ComponentWrapper,
    ActiveLevels,
    EventType,
    TrappedType,
    Nullable,
    IObservablesMouse,
    IObservablesDrag,
    IObservableDeltaMoves,
    IObservableControl
} from '@designer-core/shared/types';
import { filter, tap, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { IContextLasso } from './context';

const getSelectableWrapComponent = <TProps extends BoxProps>(
    SelectedFrameWrapper: ComponentWrapper<TProps, TProps & DragFrameProps>
) =>
    <TContext extends IContextLasso & IObservablesDrag & IObservablesMouse & IObservableDeltaMoves & IObservableControl>(
        MouseStreamContext: React.Context<Nullable<TContext>>
    ) =>

        (Component: React.ComponentType<TProps>) => {

            const SelectedFrameComponent = SelectedFrameWrapper(Component);

            const ResultComponent = (props: React.PropsWithChildren<TProps & Partial<DragFrameProps>>) => {

                const { activeLevel$, guid, xy$, position$, size$ } = props;

                const activeLevelRef = useRef(activeLevel$.getValue());

                const startXYRef = useRef([0, 0]) as React.MutableRefObject<Position>;
                const [inLasso, setInLasso] = useState(false);
                const inLassoRef = useRef(inLasso) as React.MutableRefObject<typeof inLasso>;
                const groupDragRef = useRef(false) as React.MutableRefObject<boolean>;

                const mouseContext = useContext(MouseStreamContext) as TContext;

                //  clear group items in Lasso (moving non-group block)
                useEffect(() => {
                    const lassoStartSub = mouseContext.mouseDown.pipe(
                        filter(({ elementId }) =>
                            inLassoRef.current && (
                                (elementId === SELECTING_FRAME_GUID || !mouseContext.group.getValue().includes(elementId))
                                && mouseContext.group.getValue().includes(guid)
                            )
                        )
                    ).subscribe(({ ev }) => {
                        groupDragRef.current = false;
                        mouseContext.dragStop.next({ elementId: guid, ev, type: EventType.StopDrag });
                        mouseContext.group.next(mouseContext.group.getValue().filter(t => t !== guid));
                        inLassoRef.current = false;

                        activeLevel$.next(ActiveLevels.None);

                        setInLasso(false);
                    });
                    return () => {
                        lassoStartSub.unsubscribe();
                    }
                }, [guid, mouseContext, activeLevel$, inLassoRef, groupDragRef]);

                //  clear drag status
                useEffect(() => {
                    const dragGroupStopSub = mouseContext.mouseStop.pipe(
                        filter(_ => groupDragRef.current && inLassoRef.current && mouseContext.group.getValue().includes(guid)),
                    ).subscribe(({ ev }) => {
                        groupDragRef.current = false;
                        mouseContext.dragStop.next({ elementId: guid, ev: ev, type: EventType.StopDrag });
                    });
                    return () => {
                        dragGroupStopSub.unsubscribe();
                    }
                }, [guid, mouseContext, inLassoRef, groupDragRef]);

                //  changing X-Y position (calculate new position for group)
                useEffect(() => {
                    const groupsSubscription = mouseContext.mouseDown.pipe(
                        filter(({ elementId }) => inLassoRef.current && elementId !== SELECTING_FRAME_GUID && mouseContext.group.getValue().includes(elementId)),
                        tap(_ => startXYRef.current = xy$.getValue()),
                        tap(({ ev, elementId }) => {
                            if (!groupDragRef.current) groupDragRef.current = true;
                            // start drag stream for another items in group!
                            guid !== elementId && mouseContext.dragStart.next({ elementId: guid, ev: ev, type: EventType.DragInGroup });
                        }),
                        switchMap(
                            ({ elementId: startElementId }) => {
                                return mouseContext.deltaMoves.pipe(
                                    filter(([elementId, _]) => elementId === startElementId && elementId === guid),
                                    takeUntil(mouseContext.dragStop.pipe(filter(({ elementId }) => elementId === guid)))
                                )
                            }
                        )
                    ).subscribe(([_elementId, position]) => {
                        const [startX, startY] = startXYRef.current;
                        xy$.next([startX + position[0], startY + position[1]]);
                        mouseContext.group.getValue().forEach(tId => tId !== guid && mouseContext.deltaMoves.next([tId, position]));
                    });
                    return () => {
                        groupsSubscription.unsubscribe();
                    };
                }, [guid, mouseContext, startXYRef, xy$, position$, activeLevel$, inLassoRef, groupDragRef]);


                //  set inLasso flag (by intersection calculating)
                useEffect(() => {
                    const lassoSubscription = mouseContext.lasso.subscribe(({ end, start, trapped }) => {

                        const positionStart = xy$.getValue();
                        const currentSize = size$.getValue();

                        const positionEnd = [positionStart[0] + currentSize[0], positionStart[1] + currentSize[1]];
                        let inLasso = start[0] < positionStart[0] && end[0] > positionEnd[0];
                        inLasso = inLasso && start[1] < positionStart[1] && end[1] > positionEnd[1];
                        if (inLasso !== inLassoRef.current) {
                            if (end[0] || end[1] || start[0] || start[1]) {
                                inLasso && mouseContext.trapping.next([{ guid, trappedType: TrappedType.In }]);
                                !inLasso && mouseContext.trapping.next([{ guid, trappedType: TrappedType.Out }]);
                                inLassoRef.current = inLasso;


                                let level = activeLevel$.getValue();

                                if (inLasso) {
                                    activeLevelRef.current = activeLevel$.getValue();

                                    level = level === ActiveLevels.None ? ActiveLevels.InGroup : level;
                                    level = level === ActiveLevels.Hover ? ActiveLevels.HoverInGroup : level;

                                } else level = activeLevelRef.current;

                                activeLevel$.next(level);

                                setInLasso(inLasso);
                            }
                        }
                    });
                    return () => {
                        lassoSubscription.unsubscribe();
                    };
                }, [guid, mouseContext, xy$, size$, activeLevel$, activeLevelRef, inLassoRef]);

                const _classModifiers = props.classModifiers || [];
                const classModifiers = inLasso ? [..._classModifiers, 'in-lasso-trapped'] : [..._classModifiers];

                return <SelectedFrameComponent { ...props } classModifiers={ classModifiers }>
                    { props.children }
                </SelectedFrameComponent>;
            };
            return ResultComponent;
        };


export const getSelectableLasso = <TContext extends IContextLasso & IObservablesDrag & IObservableDeltaMoves>(
    MouseStreamContext: React.Context<Nullable<TContext>>
) =>
    <TProps extends BoxProps>(BlockWrapper: React.ComponentType<TProps>) => {

        const ResultComponent = (props: React.PropsWithChildren<TProps>) => {

            const { size$, position$, offsetPosition$ } = props;

            const mouseContext = useContext(MouseStreamContext) as TContext;

            const fixStartPositionRef = useRef([0, 0]) as React.MutableRefObject<Position>;
            const trappedRef = useRef([]) as React.MutableRefObject<GuidType[]>;

            const newSize$ = useMemo<BehaviorSubject<Position>>(() => new BehaviorSubject(size$.getValue()), [size$]);

            const emptyPosition$ = useMemo<BehaviorSubject<Position>>(() => new BehaviorSubject([0, 0]), []);
            const emptyXY$ = useMemo<BehaviorSubject<Position>>(() => new BehaviorSubject([0, 0]), []);

            useEffect(() => {

                console.log('%c init sub in Lasso ', 'background-color: yellow; color: red; border: 1px solid black;');

                const lassoMoveSub = mouseContext.dragStart
                    .pipe(
                        filter(({ elementId }) => SELECTING_FRAME_GUID === elementId),
                        tap(({ ev }) => {
                            const [px, py] = offsetPosition$.getValue();
                            console.log('offsetPosition$', [px, py]);
                            fixStartPositionRef.current = [ev.clientX - px, ev.clientY - py];
                            position$.next([ev.clientX - px, ev.clientY - py]);
                        }),
                        switchMap(_ => mouseContext.deltaMoves.pipe(
                            takeUntil(mouseContext.dragStop.pipe(
                                tap(_ => {
                                    fixStartPositionRef.current = [0, 0];
                                    position$.next([0, 0]);
                                    newSize$.next([0, 0]);
                                    mouseContext.lasso.next({ start: [0, 0], end: [0, 0], trapped: [] });
                                })
                            ))
                        ))
                    )
                    .subscribe(([_, position]) => {
                        const [rx, ry] = position;
                        const [_startX, _startY] = fixStartPositionRef.current;
                        let x = _startX, y = _startY;
                        let sx = rx, sy = ry;
                        if (rx < 0) { sx = -rx; x = _startX + rx; }
                        if (ry < 0) { sy = -ry; y = _startY + ry; }

                        if (rx < 0 || ry < 0) {
                            position$.next([x, y]);
                        }
                        newSize$.next([sx, sy]);

                        mouseContext.lasso.next({
                            start: [x, y],
                            end: [x + sx, y + sy],
                            trapped: []
                        });
                    });

                return () => {
                    console.log('%c unsub in selectable lasso: handlers ', 'color: yellow; background-color: brown;');
                    lassoMoveSub.unsubscribe();
                };
            }, [mouseContext, emptyXY$, newSize$, position$, offsetPosition$, fixStartPositionRef, trappedRef]);

            return (
                <BlockWrapper
                    { ...props }
                    size$={ newSize$ }
                    xy$={ emptyXY$ }
                    position$={ emptyPosition$ }
                    classModifiers={ ['selectable'] }
                    classBlocks={ ['block'] }
                    classElements={ ['selecting-frame'] }
                >
                    { props.children }
                </BlockWrapper>
            );
        };

        return ResultComponent;
    };


export default getSelectableWrapComponent;
