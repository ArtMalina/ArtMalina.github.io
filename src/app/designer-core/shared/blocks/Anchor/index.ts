import AnchorDiv from './AnchorDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, AnchorDiv]
];

export default AnchorDiv;
