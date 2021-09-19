import DragFrameDiv from './DragFrameDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, DragFrameDiv]
];

export default DragFrameDiv;
