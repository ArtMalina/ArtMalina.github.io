import React, { useMemo, useContext } from 'react';

import { useSubscribedState } from '@designer-core/shared/helpers/storage';

import AnchorBlock from '@designer-core/shared/blocks/Anchor';

import { ROOT_GUID, BoxProps, DragFrameProps, ActiveLevels, IMouseStreamContext, EventType } from '@designer-core/shared/types';
import { IContextResizer } from './context';


export const [MIN_WIDTH, MIN_HEIGHT] = [60, 60];


const RESIZE_ICON = <svg className="anchor_icon anchor_icon--resize" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
    <line fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" x1="6" y1="26" x2="26" y2="6" />
    <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="13,27 5,27 5,19 " />
    <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="19,5 27,5 27,13 " />
    <line fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" x1="6" y1="6" x2="26" y2="26" />
    <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="5,13 5,5 13,5 " />
    <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="27,19 27,27 19,27 " />
</svg>;


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
                        && <AnchorBlock { ...props } handlers={ { ...anchorHandler } } classModifiers={ [...activeLevelArr] } icon={ RESIZE_ICON } />
                    }
                </Component>
            );
        };

        return ResultBlock;
    }

export default ResizeWrapper;
