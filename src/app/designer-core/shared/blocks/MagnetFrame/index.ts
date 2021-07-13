import MagnetFrameDiv from './MagnetFrameDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, MagnetFrameDiv]
];


export default MagnetFrameDiv;
