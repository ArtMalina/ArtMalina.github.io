import SelectedFrameDiv from './SelectedFrameDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, SelectedFrameDiv]
];

export default SelectedFrameDiv;
