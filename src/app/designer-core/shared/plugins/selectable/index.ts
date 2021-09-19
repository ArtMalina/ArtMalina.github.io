import context, { IContextLasso as IContext } from './context';
import Selectable, { getSelectableLasso } from './Selectable';
import FrameWrapper from './SelectedFrameWrapper';

export type IContextLasso = IContext;

export { context };

export { getSelectableLasso };

export default Selectable(FrameWrapper);
