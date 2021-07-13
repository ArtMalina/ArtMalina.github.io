import React, { useContext, useRef, useMemo, useEffect } from 'react';
import {
    GuidType,
    BoxProps,
    DragFrameProps,
    IMouseStreamContext,
    ActiveLevels,
    EventType,
    Nullable,
    ComponentWrapper
} from '@designer-core/shared/types';


import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IState } from '@designer-core/shared/stateTypes';
import { MsgService, useStorage, } from '@designer-core/shared/helpers/storage';


const getDragWrapComponent = <TProps extends BoxProps & DragFrameProps>(
    DragFrameWrapper: ComponentWrapper<TProps, TProps>
) =>
    <TContext extends IMouseStreamContext>(
        MouseStreamContext: React.Context<Nullable<TContext>>,
        getHandlers: (elementId: GuidType, mContext: TContext) => React.DOMAttributes<HTMLElement>
    ) => (Component: React.ComponentType<TProps>, services: MsgService<IState, any>[], _selectors: any) => {

        const MovingComponent = DragFrameWrapper(Component);

        const ResultComponent = (props: React.PropsWithChildren<TProps>) => {

            const { guid, position$, xy$, activeLevel$ } = props;

            const mouseContext = useContext(MouseStreamContext) as TContext;

            const storage = useStorage(`draggable: ${guid}`, services, []);

            const startPositionRef = useRef(xy$.getValue());
            const activeLevelRef = useRef(activeLevel$.getValue());

            const handlers = useMemo<React.DOMAttributes<HTMLElement>>(() => {
                return getHandlers(guid, mouseContext);
            }, [guid, mouseContext]);

            useEffect(() => {
                const moveSubscription: Subscription = mouseContext.deltaMoves.pipe(
                    filter(([elementId]) => guid === elementId)
                ).subscribe(([_elementId, deltaPosition]) => {

                    const [x, y] = deltaPosition;
                    const [lx, ly] = startPositionRef.current;
                    const [newX, newY] = [x + lx, y + ly];

                    storage.send('position', [guid, [newX, newY]]);

                    xy$.next([newX, newY]);
                });
                return () => moveSubscription.unsubscribe();
            }, [mouseContext, storage, guid, xy$]);

            useEffect(() => {

                const stopSubscription = mouseContext.dragStop.pipe(
                    filter(({ elementId }) => elementId === guid),
                ).subscribe((_) => {
                    activeLevel$.next(activeLevelRef.current);
                    const [x, y] = position$.getValue();
                    startPositionRef.current = [x, y];
                });

                const startSubscription = mouseContext.dragStart.pipe(
                    filter(({ elementId }) => elementId === guid)
                ).subscribe(({ type }) => {

                    activeLevelRef.current = activeLevel$.getValue();
                    // drag as part of selected group!
                    let level = type === EventType.DragInGroup ? ActiveLevels.MoveInGroup : activeLevelRef.current;
                    if (type !== EventType.DragInGroup) {
                        level = level === ActiveLevels.Hover ? ActiveLevels.MoveByHand : level;
                        level = level === ActiveLevels.HoverInGroup ? ActiveLevels.MoveByHandInGroup : level;
                    }
                    activeLevel$.next(level);

                    const [x, y] = position$.getValue();
                    startPositionRef.current = [x, y];
                });


                return () => {
                    startSubscription.unsubscribe();
                    stopSubscription.unsubscribe();
                };
            }, [guid, mouseContext, position$, xy$, activeLevel$, startPositionRef, activeLevelRef]);

            return (
                <MovingComponent { ...props } handlers={ handlers }>
                    { props.children }
                </MovingComponent>
            );
        };

        return ResultComponent;
    };


export default getDragWrapComponent;
