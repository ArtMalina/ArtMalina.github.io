import { IBlockFactory, factory } from './blocks';
import { RendererType } from './blocks/types';

export const blockFactory: IBlockFactory = factory(RendererType.HTML);
