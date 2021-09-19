import {
    ContextPlugin,
    IObservablesMouse,
    IObservablesDrag,
    SELECTING_FRAME_GUID,
    ILassoStreamData,
    ITrappedItem,
    TrappedType,
    IObservableControl,
} from '@designer-core/shared/types';
import { Subject } from 'rxjs';
import { tap, switchMap, takeUntil, scan } from 'rxjs/operators';

export interface IContextLasso {
    lasso: Subject<ILassoStreamData>;
    trapping: Subject<ITrappedItem[]>;
    // trapped: BehaviorSubject<GuidType[]>;
}

const contextPart: IContextLasso = {
    lasso: new Subject(),
    trapping: new Subject(),
    // trapped: new BehaviorSubject<GuidType[]>([]),
};

const getReactEffect = (mouseStreamContext: IContextLasso & IObservablesDrag & IObservablesMouse & IObservableControl): React.EffectCallback => () => {

    const source$ = mouseStreamContext.dragStart.pipe(
        tap(({ elementId }) => elementId === SELECTING_FRAME_GUID && mouseStreamContext.group.next([])),
        switchMap(
            _ => mouseStreamContext.trapping.pipe(
                scan((acc, [val]) => {
                    const inAcc = acc.filter(t => val && t.guid === val.guid).length;
                    const toAcc = inAcc ? [] : [val];
                    return val && val.trappedType === TrappedType.In ? [...acc, ...toAcc] : acc.filter(t => val && t.guid !== val.guid);
                }, [] as ITrappedItem[]),
                tap(values => mouseStreamContext.group.next(values.map(x => x.guid))),
                takeUntil(mouseStreamContext.mouseStop)
            )
        )
    );

    const subscribtion = source$.subscribe(_ => { });


    return () => {
        subscribtion.unsubscribe();
    }
};

const getDeps = (mouseStreamContext: IContextLasso & IObservablesMouse & IObservablesDrag & IObservableControl): React.DependencyList => [mouseStreamContext];

const contextPlugin: ContextPlugin<IContextLasso & IObservablesMouse & IObservablesDrag & IObservableControl, IContextLasso> = [
    { ...contextPart },
    (mouseContext) => [getReactEffect(mouseContext), getDeps(mouseContext)]
];

export default contextPlugin;
