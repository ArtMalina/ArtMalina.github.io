import {
    ContextPlugin,
    IObservablesMouse,
    IObservablesDrag,
    IMagnetStreamData,
    IMagnetPair,
    MagnetPairDirection,
    SELECTING_FRAME_GUID,
    ROOT_GUID,
    GuidType,
} from '@designer-core/shared/types';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, switchMap, takeUntil } from 'rxjs/operators';

export interface IContextMagnet {
    magneted: BehaviorSubject<IMagnetStreamData[]>;
    magneting: Subject<IMagnetPair>;
    magnetingStart: Subject<GuidType>;
}

const contextPart: IContextMagnet = {
    magneted: new BehaviorSubject<IMagnetStreamData[]>([]),
    magneting: new Subject<IMagnetPair>(),
    magnetingStart: new Subject(),
};

const getReactEffect = (mouseStreamContext: IContextMagnet & IObservablesDrag & IObservablesMouse): React.EffectCallback => () => {

    const source$ = mouseStreamContext.magnetingStart.pipe(
        tap((elementId) => elementId !== SELECTING_FRAME_GUID && elementId !== ROOT_GUID),
        switchMap(
            // magneting IN
            //      -> clear previous magnet pair! (we could have multiple pairs with GUID-ONE and many GUIDs TWO)
            // magneting OUT
            //      -> clear all pairs for current (in common case - we have multiple pairs for one GUID, but here - ONE GUID - ONE PAIR)
            _ => mouseStreamContext.magneting.pipe(
                tap(
                    val => {

                        const magnetedItems = mouseStreamContext.magneted.getValue();

                        const [fixGuid] = val.items;
                        const magnetingGuid = val.direction === MagnetPairDirection.In ? val.items[1] : null;

                        const asInPairs: IMagnetStreamData[] = val.direction === MagnetPairDirection.In
                            ? magnetedItems.filter(t => t.magneted[0] !== fixGuid || t.magneted[1] !== magnetingGuid)
                            : [];

                        const inPairs: IMagnetStreamData[] = val.direction === MagnetPairDirection.In
                            ? [...asInPairs, { magneted: [fixGuid, magnetingGuid], type: val.type }]
                            : [];

                        const outPairs: IMagnetStreamData[] = val.direction === MagnetPairDirection.Out
                            ? magnetedItems.filter(t => !t.magneted.includes(fixGuid))
                            : [];

                        mouseStreamContext.magneted.next([...inPairs, ...outPairs]);
                    }
                ),
                takeUntil(mouseStreamContext.mouseStop)
            )
        )
    );

    const subscribtion = source$.subscribe(_ => { });


    return () => {
        subscribtion.unsubscribe();
    }
};

const getDeps = (mouseStreamContext: IContextMagnet & IObservablesMouse & IObservablesDrag): React.DependencyList => [mouseStreamContext];

const contextPlugin: ContextPlugin<IContextMagnet & IObservablesMouse & IObservablesDrag, IContextMagnet> = [
    { ...contextPart },
    (mouseContext) => [getReactEffect(mouseContext), getDeps(mouseContext)]
];

export default contextPlugin;
