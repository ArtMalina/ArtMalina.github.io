import React from 'react';

import getMouseStreamsContainer from './MouseStreamsContainer';


// <new wrappers> (as plugins, may be we should use plugin as tuple [PluginFunction, FrameBlock, context part? ] ) 
import DragFrame from './draggable/DragFrameWrapper';
import WrapComponentInDraggable from './draggable/Draggable';

import MagnetableWithMouseContext, { IContextMagnet, context as magnetContextPlugin } from '@designer-core/shared/plugins/magnetable';
import ResizableWithMouseContext, { IContextResizer, context as resizerContextPlugin } from '@designer-core/shared/plugins/resizable';
import SelectableWithMouseContext, { IContextLasso, getSelectableLasso, context as lassoContextPlugin } from '@designer-core/shared/plugins/selectable';

import {
    SELECTING_FRAME_GUID,
    GuidType,
    IMouseStreamContext,
    MouseButtonType,
    EventType,
    Nullable,
} from '../types';

import { ContainerProps } from '@designer-core/shared/blocks/types';



const getHandlers = (elementId: GuidType, mouseContext: IMouseStreamContext): React.DOMAttributes<HTMLElement> => {
    return {
        onMouseDown: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
            ev.stopPropagation();
            if (ev.button !== MouseButtonType.Left) return;
            const _elementId = ev.ctrlKey ? SELECTING_FRAME_GUID : elementId;
            mouseContext.control.next(_elementId);
            console.log('start on mouseDown', _elementId);
            mouseContext.mouseDown.next({
                ev: ev.nativeEvent,
                type: ev.ctrlKey ? EventType.StartSelecting : EventType.StartDrag,
                elementId: _elementId
            });
        },
        onMouseUp: (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
            // drop to another Control (aka Container)
        }
    };
};


type PluginTypes = IContextResizer & IContextMagnet & IContextLasso;


export const MouseStreamContext = React.createContext<Nullable<IMouseStreamContext & PluginTypes>>(null);

type NamedContainer = ContainerProps & { guid: GuidType };

export const MouseStreamContainer = getMouseStreamsContainer<NamedContainer, PluginTypes>(
    MouseStreamContext,
    [
        resizerContextPlugin,
        magnetContextPlugin,
        lassoContextPlugin
    ]
);


export const Draggable = WrapComponentInDraggable(DragFrame)(MouseStreamContext, getHandlers);

// plugins
export const Magnetable = MagnetableWithMouseContext(MouseStreamContext);
export const Resizable = ResizableWithMouseContext(MouseStreamContext);
export const Selectable = SelectableWithMouseContext(MouseStreamContext);
export const SelectingLasso = getSelectableLasso(MouseStreamContext);
