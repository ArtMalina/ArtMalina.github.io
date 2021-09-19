import context, { IContextMagnet as IContext } from './context';
import Magnetable from './Magnetable';
import FrameWrapper, { CAPTURE_DELTA, Indents } from './MagnetFrameWrapper';
import { NearestResult as Nearest } from './types';

export type IContextMagnet = IContext;
export type NearestResult = Nearest;

export { context };

export default Magnetable(FrameWrapper, { CAPTURE_DELTA, Indents });
