import React, { useContext, useEffect, useRef } from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

import { withLatestFrom } from 'rxjs/operators';
import { IStore, IAction, ReducerMapper, ActionName, ActionReducerTuple, UsingReducer, MapStateToProps, ActionFunc } from './storeTypes';
import { IState } from '@designer-core/shared/stateTypes';


const _INIT_ACTION_ = '_init-action_' as ActionName;


class Store<TState> implements IStore<TState> {

    change = new BehaviorSubject<IAction<any>>({ type: _INIT_ACTION_, payload: null });

    private _actionSub: Subscription;

    constructor(public state: TState, private _reducers: ReducerMapper<TState>[]) {
        this._actionSub = this.change.pipe(
            // tap(action => this._reducers.map((reducer) => reducer(this.state, action)))
        ).subscribe((val) => {
            console.log('action change: ', val);
        });
    }

    dispatch<TPayload>(action: IAction<TPayload>): Observable<IAction<TPayload>> {
        console.log('--->dispatch action: ', action);
        // this.change.next(action);
        return this.change;
    }

    close() {
        this.change.complete();
        this._actionSub.unsubscribe();
    }
}

export const combineReducers: UsingReducer = <TPayload extends {}>(reducerMappers: ActionReducerTuple<IState, TPayload>[]) =>
    (state: IState, action: IAction<TPayload>) =>
        reducerMappers
            .filter(([actionName, _]) => actionName === action.type)
            .forEach(([_, payloadReducer]) => payloadReducer(state, action.payload));


const StoreContext = React.createContext<IStore<any> | null>(null);

export const useSelector = <TState extends {}>(fn: Function) => {
    const store = useContext(StoreContext) as IStore<TState>;
    return fn(store.state);
};


export const connect = <TState, TProps>(selector: MapStateToProps<TState, TProps>) =>

    (Component: React.ComponentType<TProps>) => {

        const Result = (props: React.PropsWithChildren<TProps>) => {

            const propsRef = useRef(props);

            const store = useContext(StoreContext) as IStore<TState>;

            console.log(1111, props);

            useEffect(() => {

                console.log(222, propsRef.current);
                const [parent$, selectors] = selector(store.state, propsRef.current);
                const sub = store.change.pipe(
                    withLatestFrom(parent$)
                ).subscribe((value) => {
                    selectors.forEach(_selector => _selector(store.state, propsRef.current));
                    console.log('changed pair! >', value);
                });

                store.change.subscribe(data => {
                    console.log('\n\n---------------- CHANGE STORE DATA -----');
                    console.log('data: ', data);
                    console.log('---------------- CHANGE STORE DATA END-----\n\n');
                });
                return () => {
                    sub.unsubscribe();
                }
            }, [propsRef, store]);

            return <Component { ...props }>{ props.children }</Component>;
        };

        return Result;
    };


export const useAction = <TPayload, TState>(actionFunc: ActionFunc<TPayload>) => {


    const Result = (payload: TPayload) => {

        const store = useContext(StoreContext) as IStore<TState>;

        const action = actionFunc(payload);

        useEffect(() => {

            let sub: Subscription | null = null;

            if (action instanceof Observable) sub = action.subscribe(_action => store.dispatch(_action));
            else store.dispatch<TPayload>(action);

            return () => {
                sub && sub.unsubscribe();
            }
        }, [store, action]);

        // console.log('useAction', action);


        // return action instanceof Observable ? action.pipe(switchMap(_action => store.dispatch(_action))) : store.dispatch<TPayload>(action);
    };

    return Result;
};


export const useStore = <TState extends {}>(initialStore: TState, reducers: ReducerMapper<TState>[]): [IStore<TState>, React.Provider<IStore<TState> | null>] => {
    const store = new Store(initialStore, reducers);
    return [store, StoreContext.Provider];
};

export default StoreContext;
