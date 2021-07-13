import { MapStateToProps, IStore, SelectorMap } from './storeTypes';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { useContext, Context } from 'react';

export const combineSelectors = <TState, TData, TProps>(parent$: BehaviorSubject<TData>, name: string, selectors: SelectorMap<TState, TProps>[]): MapStateToProps<TState, TProps> =>
    (state: TState, props: TProps, options?: any) => [parent$, selectors];
// parent$.pipe(
//     tap(_ => selectors.map(_selector => _selector(state, props, options))),
//     map(data => [name, data])
// );


export const useCustomReducer = <TState extends {}>(StoreContext: Context<IStore<TState>>) => {
    return function Result(reducerFunc: any) {
        const store = useContext(StoreContext);
        // store.dispatch
        return reducerFunc(store);
    };
};
