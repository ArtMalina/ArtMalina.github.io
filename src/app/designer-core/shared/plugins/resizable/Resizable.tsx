import React, { useContext, useRef, useEffect } from 'react';

import {
    BoxProps,
    DragFrameProps,
    Nullable,
    ComponentContextWrapper,
} from '@designer-core/shared/types';
import { MIN_HEIGHT, MIN_WIDTH } from './ResizeFrameWrapper';

import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IState } from '@designer-core/shared/stateTypes';
import { MsgService, MsgSelector, useStorage } from '@designer-core/shared/helpers/storage';
import { IContextResizer } from './context';


const getResizeWrapComponent = <TProps extends BoxProps, TContext extends IContextResizer>(
    ResizeWrapper: ComponentContextWrapper<TProps, TProps & DragFrameProps, TContext>
) =>
    (MouseStreamContext: React.Context<Nullable<TContext>>) =>

        (Component: React.ComponentType<TProps>, services: MsgService<IState, any>[], selectors: MsgSelector<IState, any, any>[]) => {

            const ResizingComponent = ResizeWrapper(Component, MouseStreamContext as React.Context<TContext>);

            const ResultComponent = (props: React.PropsWithChildren<TProps & Partial<DragFrameProps>>) => {

                const { guid, activeLevel$, size$ } = props;

                const storage = useStorage(`resizable: ${guid}`, services, selectors);

                const mouseContext = useContext(MouseStreamContext) as TContext;

                const fixStartSizeRef = useRef(size$.getValue());

                useEffect(() => {

                    const startSubscription = mouseContext.resizeStart.pipe(
                        filter(({ elementId }) => elementId === guid)
                    ).subscribe((_) => {
                        const [sx, sy] = size$.getValue();
                        fixStartSizeRef.current = [sx, sy];
                    });
                    const moveSubscription: Subscription = mouseContext.resize.pipe(
                        filter(([elementId]) => guid === elementId)
                    ).subscribe(([_elementId, position]) => {

                        const [dx, dy] = position;
                        const [ndx, ndy] = [fixStartSizeRef.current[0] + dx, fixStartSizeRef.current[1] + dy];

                        if (ndx > MIN_WIDTH || ndy > MIN_HEIGHT) {

                            const [odx, ody] = size$.getValue();
                            const [nextSx, nextSy] = [ndx > MIN_WIDTH ? ndx : odx, ndy > MIN_HEIGHT ? ndy : ody];

                            storage.send('size', [guid, [nextSx, nextSy]]);

                            size$.next([nextSx, nextSy]);
                        }
                    });
                    return () => {
                        console.log('subscription unsub!', guid);
                        moveSubscription.unsubscribe();
                        startSubscription.unsubscribe();
                    };
                }, [guid, mouseContext, storage, activeLevel$, fixStartSizeRef, size$]);

                return (
                    <ResizingComponent { ...props }>
                        { props.children }
                    </ResizingComponent>
                );
            };

            return ResultComponent;
        };

export default getResizeWrapComponent;
