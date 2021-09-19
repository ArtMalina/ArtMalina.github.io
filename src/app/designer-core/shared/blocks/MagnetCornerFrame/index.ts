import MagnetCornerFrameDiv from './MagnetCornerFrameDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, MagnetCornerFrameDiv]
];

export default MagnetCornerFrameDiv;
