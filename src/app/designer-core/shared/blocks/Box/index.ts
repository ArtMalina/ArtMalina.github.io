import BoxDiv from './BoxDiv';
import { RendererType } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<any>]> = [
    [RendererType.HTML, BoxDiv]
];

export default BoxDiv;
