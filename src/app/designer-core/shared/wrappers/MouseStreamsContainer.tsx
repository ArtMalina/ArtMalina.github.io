import React, { useMemo, useEffect, useRef } from 'react';
import {
    ROOT_GUID,
    IMouseStreamContext,
    GuidType,
    IStreamData,
    EventType,
    Nullable,
    ContextPlugin
} from '../types';

import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { tap, map, switchMap, takeUntil } from 'rxjs/operators';


const getMouseStreamContainer = <TStartProps extends {}, TContextParts>(
    MouseStreamContext: React.Context<Nullable<IMouseStreamContext & TContextParts>>,
    plugins: ContextPlugin<any, any>[]
) =>
    (StartBlock: React.ComponentType<TStartProps>) => {

        const Container = (props: React.PropsWithChildren<TStartProps>) => {

            const pluginsRef = useRef(plugins);

            const contextParts = useMemo<TContextParts>(() => {
                const result: TContextParts = pluginsRef.current.reduce((memo, el: ContextPlugin<any, TContextParts>) => ({ ...memo, ...el[0] }), {} as TContextParts);
                return result;
            }, [pluginsRef]);


            const mouseStreamContext = useMemo<IMouseStreamContext & TContextParts>(() => ({

                dragStart: new Subject(),
                drag: new Subject(),
                dragStop: new Subject(),

                control: new BehaviorSubject<GuidType>(null),
                group: new BehaviorSubject<GuidType[]>([]),
                deltaMoves: new Subject(),


                mouseDown: new Subject(),
                mouseMove: new Subject(),
                mouseUp: new Subject(),
                mouseLeave: new Subject(),
                mouseStop: new Subject(),

                ...contextParts

            }), [contextParts]);


            useEffect(() => {
                console.log('%c start launch plugins ', 'color: yellow; background-color: darkgreen');
                const effects = pluginsRef.current.map(([_part, func]) => {
                    const [effect] = func(mouseStreamContext);
                    return effect;
                });
                const mainEffect = () => {
                    const results = effects.map(t => t());
                    return () => {
                        results.forEach(endFunc => endFunc && endFunc());
                    };
                };
                const resultMainEffect = mainEffect();
                return () => {
                    console.log('%c stop launch plugins ', 'color: lime; background-color: darkgreen');
                    resultMainEffect();
                }
            }, [mouseStreamContext, pluginsRef]);


            const startMoving$ = useMemo(() => {
                return mouseStreamContext.mouseDown.pipe(
                    tap(ev => console.warn('tap mouseDowen elementid', ev.elementId, ev.type)),
                    map(data => [data.elementId, { ...data }] as [GuidType, IStreamData])
                );
            }, [mouseStreamContext]);

            //  main stream: stop and start moving
            const movingSource$ = useMemo(() => {
                return startMoving$.pipe(
                    tap(([elementId]) => console.log('start moving!', elementId)),
                    switchMap(
                        data => combineLatest(
                            new BehaviorSubject(data),
                            mouseStreamContext.mouseMove
                        ).pipe(
                            takeUntil(mouseStreamContext.mouseStop.pipe(
                                tap(({ ev }) => {
                                    const elementId = mouseStreamContext.control.getValue();
                                    mouseStreamContext.dragStop.next({ elementId, ev, type: EventType.StopDrag });
                                    mouseStreamContext.control.next(null);
                                })
                            ))
                        )
                    )
                );
            }, [mouseStreamContext, startMoving$]);

            useEffect(() => {

                console.warn('\n\n effect in stream-container');

                const movingSubscription = movingSource$.subscribe(([[elementId, start], move]) => {
                    const [startX, startY] = [start.ev.clientX, start.ev.clientY];
                    mouseStreamContext.deltaMoves.next([elementId, [move.ev.clientX - startX, move.ev.clientY - startY]]);
                    mouseStreamContext.drag.next({ ...move, elementId: mouseStreamContext.control.getValue() });
                });

                const startDragSubscription = startMoving$.subscribe(([elementId, start]) => {
                    mouseStreamContext.dragStart.next({ elementId, type: EventType.StartDrag, ev: start.ev });
                });

                const stopDragSubsciption = mouseStreamContext.mouseStop.subscribe((_) => {
                    const currControl = mouseStreamContext.control.getValue();
                    console.log('stop listening in main Drag container', currControl);
                });


                return () => {
                    console.log('\n\n clear in stream-container');

                    mouseStreamContext.mouseDown.complete();
                    mouseStreamContext.mouseMove.complete();
                    mouseStreamContext.mouseStop.complete();

                    mouseStreamContext.control.complete();
                    mouseStreamContext.deltaMoves.complete();

                    movingSubscription.unsubscribe();
                    startDragSubscription.unsubscribe();
                    stopDragSubsciption.unsubscribe();
                };
            }, [mouseStreamContext, movingSource$, startMoving$]);

            const handlers = useMemo<React.DOMAttributes<HTMLDivElement>>(() => ({
                onMouseDown: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => { },
                onMouseMove: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    mouseStreamContext.mouseMove.next({ elementId: ROOT_GUID, ev: ev.nativeEvent, type: EventType.Move });
                },
                onMouseUp: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    mouseStreamContext.mouseUp.next({ elementId: ROOT_GUID, ev: ev.nativeEvent, type: EventType.Cancel });
                    mouseStreamContext.mouseStop.next({ elementId: ROOT_GUID, ev: ev.nativeEvent, type: EventType.Cancel });
                },
                onMouseLeave: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    mouseStreamContext.mouseLeave.next({ elementId: ROOT_GUID, ev: ev.nativeEvent, type: EventType.Cancel });
                    mouseStreamContext.mouseStop.next({ elementId: ROOT_GUID, ev: ev.nativeEvent, type: EventType.Cancel });
                }

            }), [mouseStreamContext]);

            return (
                <StartBlock { ...props } handlers={ handlers }>
                    <MouseStreamContext.Provider value={ mouseStreamContext }>
                        { props.children }
                    </MouseStreamContext.Provider>
                </StartBlock>
            );
        };

        return Container;
    };

export default getMouseStreamContainer;
