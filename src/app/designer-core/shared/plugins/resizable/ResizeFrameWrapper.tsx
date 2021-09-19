import React, { useMemo, useContext } from 'react';

import { useSubscribedState } from '@designer-core/shared/helpers/storage';

import AnchorBlock from '@designer-core/shared/blocks/Anchor';

import { ROOT_GUID, BoxProps, DragFrameProps, ActiveLevels, IMouseStreamContext, EventType } from '@designer-core/shared/types';
import { IContextResizer } from './context';


export const [MIN_WIDTH, MIN_HEIGHT] = [60, 60];


const ResizeWrapper =
    <TProps extends BoxProps, TContext extends IMouseStreamContext & IContextResizer>(
        Component: React.ComponentType<TProps>, MouseStreamContext: React.Context<TContext>
    ) => {
        const ResultBlock = (props: React.PropsWithChildren<DragFrameProps & TProps>) => {

            const { guid, activeLevel$, handlers } = props;

            const mouseContext = useContext(MouseStreamContext) as TContext;

            const [activeLevel] = useSubscribedState(activeLevel$);

            const updHandlers = useMemo<React.DOMAttributes<HTMLElement>>(
                () => handlers ? { ...handlers, onMouseDown: () => { } } : { onMouseDown: () => { } },
                [handlers]
            );

            const anchorHandler = useMemo<React.DOMAttributes<HTMLElement>>(() => ({
                onMouseDown: (ev) => {
                    ev.stopPropagation();
                    mouseContext.resizeStart.next({ elementId: guid, ev: ev.nativeEvent, type: EventType.Resize });
                }
            }), [guid, mouseContext]);

            const componentHandlers = useMemo(() => {
                return guid === ROOT_GUID ? handlers : updHandlers
            }, [guid, handlers, updHandlers]);


            const activeLevelArr = activeLevel ? ['resizer', 'active'] : ['resizer'];

            return (
                <Component { ...props } handlers={ componentHandlers }>
                    { props.children }
                    {
                        (activeLevel === ActiveLevels.Hover || activeLevel === ActiveLevels.HoverInGroup)
                        && <AnchorBlock { ...props } handlers={ { ...anchorHandler } } classModifiers={ [...activeLevelArr] } />
                    }
                </Component>
            );
        };

        return ResultBlock;
    }

export default ResizeWrapper;
