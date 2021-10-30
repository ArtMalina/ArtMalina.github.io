import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';

import { useSubscribedState } from '@designer-core/shared/helpers/storage';

import BoxBlock from '@designer-core/shared/blocks/Box';
import DragFrameBlock from '@designer-core/shared/blocks/DragFrame';
import AnchorBlock from '@designer-core/shared/blocks/Anchor';

import { SELECTING_FRAME_GUID, ROOT_GUID, BoxProps, DragFrameProps, ActiveLevels, Position, IMouseStreamContext, PluginWrapperOptions } from '@designer-core/shared/types';

import { MouseStreamContext } from '../MouseStreams';

import { WrappedBlock } from '../ConnectedBlock';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';


type DragResultProps<TProps> = DragFrameProps & TProps;

const DisplayedBlock = WrappedBlock(BoxBlock);

const DRAG_ICON = <svg className="anchor_icon anchor_icon--move" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z" />
</svg>;

const DragFrameWrapper =
    <TProps extends BoxProps>(Component: React.ComponentType<TProps & Partial<DragFrameProps>>, options?: PluginWrapperOptions) => {

        const ResultBlock = (props: React.PropsWithChildren<DragResultProps<TProps>>) => {

            const { position$, size$, xy$, activeLevel$, ...baseProps } = props;
            const { guid, handlers } = props;

            const mouseContext = useContext(MouseStreamContext) as IMouseStreamContext;

            const [isAnchorActive, setAnchorActivation] = useState(false);

            const [newSize] = useSubscribedState(size$);

            const activeLevelRef = useRef(activeLevel$.getValue());

            const [activeLevel, setActiveLevelState] = useState(activeLevel$.getValue());

            const emptyPosition$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);

            const propsMouseDown = useMemo(() => {
                return (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => handlers && handlers.onMouseDown && handlers.onMouseDown(ev)
            }, [handlers]);


            useEffect(() => {

                const emptyPosSub = emptyPosition$.pipe(
                    // because of BehaviorSubject init value is catched in subscription!
                    filter((_, i) => i > 0)
                ).subscribe(([x, y]) => {
                    position$.next([x, y]);
                });
                return () => {
                    emptyPosSub.unsubscribe();
                }
            }, [guid, xy$, position$, emptyPosition$, activeLevel$]);

            const anchorHandler = useMemo<React.DOMAttributes<HTMLDivElement>>(() => ({
                onMouseDown: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                    propsMouseDown(ev);
                }
            }), [propsMouseDown]);

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


            useEffect(() => {
                const sub = activeLevel$.subscribe((level) => {
                    console.log('drag activeLevel ' + guid, level);
                    setActiveLevelState(level);
                });
                return () => sub.unsubscribe();
            }, [guid, activeLevel$]);


            const hoverableArr = guid !== ROOT_GUID ? ['hoverable'] : [];
            const dragClassModifiers = activeLevel === ActiveLevels.MoveByHand || activeLevel === ActiveLevels.Hover ? [...hoverableArr, 'draggable', 'drag-start'] : [...hoverableArr, 'draggable'];
            const innerClassModifiers = props.classModifiers || [];
            const classModifiers = [...innerClassModifiers, 'wrapped-by-drag'];

            const isDraggableComponent = guid !== ROOT_GUID && guid !== SELECTING_FRAME_GUID;

            const optionsModifiers = options ? options.modifiers || [] : [];
            const baseClassModifiers = [...innerClassModifiers, ...optionsModifiers];

            return <DisplayedBlock
                { ...props }
                style={ null }
                activeLevel={ activeLevel }
                handlers={ { ...updHandlers } }
                classModifiers={ dragClassModifiers }>
                <DragFrameBlock { ...baseProps } classModifiers={ baseClassModifiers } activeLevel={ activeLevel } handlers={ null } size={ [newSize[0], newSize[1]] } xy={ [0, 0] } position={ [0, 0] }>
                    {
                        isDraggableComponent
                        && activeLevel !== ActiveLevels.MoveInGroup
                        && activeLevel !== ActiveLevels.InGroup
                        && <AnchorBlock
                            { ...props }
                            handlers={ { ...anchorHandler } }
                            activeLevel={ activeLevel }
                            icon={ DRAG_ICON }
                            classModifiers={ isAnchorActive && isDraggableComponent ? ['active'] : [] }
                        />
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
