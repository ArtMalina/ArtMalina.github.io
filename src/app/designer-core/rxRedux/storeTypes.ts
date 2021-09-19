import { BehaviorSubject, Observable } from 'rxjs';
import { IState } from '@designer-core/shared/stateTypes';

export type ActionName = string & { __TYPE__: 'ActionName' };

export interface IAction<T> {
    type: ActionName;
    payload: T;
}

export type ActionFunc<TPayload> = (payload: TPayload) => Observable<IAction<TPayload>> | IAction<TPayload>;

export interface IStore<TState> {
    state: TState;
    change: BehaviorSubject<IAction<any>>;
    dispatch: <TPayload>(action: IAction<TPayload>) => Observable<IAction<TPayload>>;
}

export type ReducerMapper<TState> = <TPayload>(state: TState, action: IAction<TPayload>) => void;
export type ActReducerMapper<TState, TPayload> = (state: TState, payload: TPayload) => void;
export type ActionReducerTuple<TState, TPayload> = [ActionName, ActReducerMapper<TState, TPayload>];

export type RxMappingStateToProps<TState, TProps> = (state: TState, props: TProps, options?: any) => Observable<any>;
export type RxMappingState<TState> = (state: TState) => Observable<any>;
// export type MapStateToProps<TState, TProps> = RxMappingStateToProps<TState, TProps> | RxMappingState<TState>;
export type MapStateToProps<TState, TProps> = (state: TState, props: TProps, options?: any) => [BehaviorSubject<any>, Array<SelectorMap<TState, TProps>>];


export type SelectorMap<TState, TProps> = (state: TState, props: TProps, options?: any) => void;


export type UsingReducer = <TPayload>(reducerMappers: ActionReducerTuple<IState, TPayload>[]) =>
    (state: IState, action: IAction<TPayload>) => void;
