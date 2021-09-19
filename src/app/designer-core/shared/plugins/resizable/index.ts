import context, { IContextResizer as IContext } from './context';
import Resizable from './Resizable';
import FrameWrapper from './ResizeFrameWrapper';

export type IContextResizer = IContext;

export { context };

export default Resizable(FrameWrapper);
