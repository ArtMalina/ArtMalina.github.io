import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';

import { useSubscribedState } from '@designer-core/shared/helpers/storage';

import BoxBlock from '@designer-core/shared/blocks/Box';
import DragFrameBlock from '@designer-core/shared/blocks/DragFrame';
import AnchorBlock from '@designer-core/shared/blocks/Anchor';

import { SELECTING_FRAME_GUID, ROOT_GUID, BoxProps, DragFrameProps, ActiveLevels, Position, IMouseStreamContext } from '@designer-core/shared/types';

import { MouseStreamContext } from '../MouseStreams';

import { WrappedBlock } from '../ConnectedBlock';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';


type DragResultProps<TProps> = DragFrameProps & TProps;

const DisplayedBlock = WrappedBlock(BoxBlock);

const DragFrameWrapper =
    <TProps extends BoxProps>(Component: React.ComponentType<TProps & Partial<DragFrameProps>>) => {

        const ResultBlock = (props: React.PropsWithChildren<DragResultProps<TProps>>) => {

            const { position$, size$, xy$, activeLevel$, ...baseProps } = props;
            const { guid, handlers } = props;

            const mouseContext = useContext(MouseStreamContext) as IMouseStreamContext;

            const [isAnchorActive, setAnchorActivation] = useState(false);

            const [newSize] = useSubscribedState(size$);

            const activeLevelRef = useRef(activeLevel$.getValue());

            const emptyPosition$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);

            const propsMouseDown = useMemo(() => {
                return (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => handlers && handlers.onMouseDown && handlers.onMouseDown(ev)
            }, [handlers]);


            useEffect(() => {

                const emptyPosSub = emptyPosition$.pipe(
                    filter((_, i) => i > 0)
                ).subscribe(([x, y]) => {
                    position$.next([x, y]);
                });
                return () => {
                    emptyPosSub.unsubscribe();
                }
            }, [guid, xy$, position$, emptyPosition$, activeLevel$]);

            const anchorHandler: React.DOMAttributes<HTMLDivElement> = {
                onMouseDown: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                    propsMouseDown(ev);
                }
            };

            const hover$ = useMemo(() => {
                return new Subject<number>();
            }, []);

            const updHandlers = useMemo<React.DOMAttributes<HTMLDivElement>>(
                () => handlers
                    ? {
                        ...handlers,
                        onMouseEnter: () => {
                            hover$.next(1);
                        },
                        onMouseLeave: () => {
                            hover$.next(-1);
                        },
                        onMouseDown: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            guid === ROOT_GUID && propsMouseDown(ev);
                            guid !== ROOT_GUID && ev.stopPropagation();
                        }
                    }
                    : {},
                [hover$, guid, handlers, propsMouseDown]
            );

            useEffect(() => {
                const sub = hover$
                    .pipe(
                        filter(_ => !mouseContext.control.getValue() || mouseContext.control.getValue() === guid),
                        filter(type => type === 1 ? [ActiveLevels.None, ActiveLevels.InGroup].includes(activeLevel$.getValue()) : true),
                        filter(type => type === -1 ? [ActiveLevels.Hover, ActiveLevels.HoverInGroup].includes(activeLevel$.getValue()) : true)
                    )
                    .subscribe((type) => {
                        let level = activeLevel$.getValue();
                        if (type === 1) {
                            // Enter
                            activeLevelRef.current = level;
                            level = level === ActiveLevels.None ? ActiveLevels.Hover : level;
                            level = level === ActiveLevels.InGroup ? ActiveLevels.HoverInGroup : level;
                        } else {
                            // Leave
                            level = activeLevelRef.current;
                        }

                        activeLevel$.next(level);

                        setAnchorActivation(type === 1);
                    });
                return () => {
                    console.log('unsubscribe DragFrame', guid);
                    sub.unsubscribe();
                };
            }, [guid, hover$, mouseContext, activeLevel$, activeLevelRef]);

            const activeLevel = activeLevel$.getValue();

            const hoverableArr = guid !== ROOT_GUID ? ['hoverable'] : [];
            const dragClassModifiers = activeLevel ? [...hoverableArr, 'draggable', 'drag-start'] : [...hoverableArr, 'draggable'];
            const innerClassModifiers = props.classModifiers || [];
            const classModifiers = activeLevel ? [...innerClassModifiers, 'wrapped-by-drag'] : [...innerClassModifiers];

            const isDraggableComponent = guid !== ROOT_GUID && guid !== SELECTING_FRAME_GUID;

            return <DisplayedBlock
                { ...props }
                style={ null }
                activeLevel={ activeLevel }
                handlers={ { ...updHandlers } }
                classModifiers={ dragClassModifiers }>
                <DragFrameBlock { ...baseProps } activeLevel={ activeLevel } handlers={ null } size={ [newSize[0], newSize[1]] } xy={ [0, 0] } position={ [0, 0] }>
                    {
                        isDraggableComponent
                        && activeLevel !== ActiveLevels.MoveInGroup
                        && activeLevel !== ActiveLevels.InGroup
                        && <AnchorBlock
                            { ...props }
                            handlers={ { ...anchorHandler } }
                            activeLevel={ activeLevel }
                            classModifiers={ isAnchorActive && isDraggableComponent ? ['active'] : [] } />
                    }
                    <Component
                        { ...props }
                        classModifiers={ classModifiers }
                        position$={ emptyPosition$ }
                    >
                        { props.children }
                    </Component>
                </DragFrameBlock>
            </DisplayedBlock>;
        };

        return ResultBlock;
    }

export default DragFrameWrapper;
