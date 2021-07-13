import {
    IStreamData,
    GuidType,
    ContextPlugin,
    IObservablesMouse,
    IObservableControl,
    EventType,
    Position
} from '@designer-core/shared/types';
import { Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { tap, switchMap, takeUntil } from 'rxjs/operators';

export interface IContextDrag {
    dragStart: Subject<IStreamData>;
    dragStop: Subject<IStreamData>;
    drag: Subject<IStreamData>;
}

const contextPart: IContextDrag = {
    dragStart: new Subject(),
    drag: new Subject(),
    dragStop: new Subject(),
};

const getReactEffect = (mouseStreamContext: IContextDrag & IObservablesMouse & IObservableControl): React.EffectCallback => () => {

    // const source$ = mouseStreamContext.resizeStart.pipe(
    //     tap(({ elementId }) => console.log('start resize!', elementId)),
    //     tap(({ elementId }) => mouseStreamContext.control.next(elementId)),
    //     switchMap(
    //         data => combineLatest(
    //             new BehaviorSubject(data),
    //             mouseStreamContext.mouseMove
    //         ).pipe(
    //             takeUntil(mouseStreamContext.mouseStop.pipe(
    //                 tap(({ ev }) => {
    //                     const elementId = mouseStreamContext.control.getValue();
    //                     mouseStreamContext.resizeStop.next({ elementId, ev, type: EventType.StopResize });
    //                     mouseStreamContext.control.next(null);
    //                 })
    //             ))
    //         )
    //     )
    // )

    // const subscription = source$.subscribe(([resizeStart, move]) => {
    //     const [startX, startY]: Position = [resizeStart.ev.clientX, resizeStart.ev.clientY];
    //     mouseStreamContext.resize.next([resizeStart.elementId, [move.ev.clientX - startX, move.ev.clientY - startY]]);
    // });

    return () => {
        // subscription.unsubscribe();
    }
};

const getDeps = (mouseStreamContext: IContextDrag & IObservablesMouse & IObservableControl): React.DependencyList => [mouseStreamContext];

const contextPlugin: ContextPlugin<IContextDrag & IObservablesMouse & IObservableControl, IContextDrag> = [
    { ...contextPart },
    (mouseContext) => [getReactEffect(mouseContext), getDeps(mouseContext)]
];

export default contextPlugin;
