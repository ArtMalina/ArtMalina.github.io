import ContainerDiv from './ContainerDiv';
import { RendererType, ContainerProps } from '../types';

export const renderBlockTypes: Array<[RendererType.HTML | RendererType.SVG, React.ComponentType<ContainerProps>]> = [
    [RendererType.HTML, ContainerDiv]
];

export default ContainerDiv;
