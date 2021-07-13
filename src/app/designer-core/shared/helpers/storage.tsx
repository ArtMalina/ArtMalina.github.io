import { BehaviorSubject } from 'rxjs';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { IStore } from '@designer-core/rxRedux/storeTypes';

import StoreContext from '@designer-core/rxRedux/storeContext';


export type DataSelector<TIdent, TElement> = (ident?: TIdent) => TElement;

export type StorageSelector<TState, TIdent, TElement> = (store: IStore<TState>) => DataSelector<TIdent, TElement>;

export interface IStorage {
    send<V>(key: string, value: V): void;
    get<S, V>(key: string, ident?: S): V | void;
}


export type StorageService<TData> = (value: TData) => void | Promise<any>;

export type DataService<TState, TData> = (store: IStore<TState>) => StorageService<TData>;

export type MsgService<TState, TData> = [string, DataService<TState, TData>];

export type MsgSelector<TState, TIdent, TElement> = [string, StorageSelector<TState, TIdent, TElement>];


export class Storage implements IStorage {

    constructor(private _services: Array<[string, StorageService<any>]>, private _selectors: [string, DataSelector<any, any>][]) { }

    send<V>(key: string, value: V) {
        this._services.filter(([msg]) => msg === key).forEach(([_msg, service]) => service(value));
    }
    get<S, V>(key: string, ident?: S): V | void {
        const selector = this._selectors.find(([msg, _selector]) => msg === key);
        !selector && console.log(`%c no selector -> ${key} `, 'background-color: magenta; color: yellow');
        return selector && selector[1](ident);
    }
}


export const useSubscribedState = <T extends any>(source$: BehaviorSubject<T>): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(source$.getValue());
    useEffect(() => {
        const subscription = source$.subscribe(value => setState(value));
        return () => subscription.unsubscribe();
    }, [source$]);
    return [state, setState];
};

export const useStorage = <TState extends any>(
    guid: string,
    services: MsgService<TState, any>[],
    selectors: MsgSelector<TState, any, any>[]
): IStorage => {

    const store = useContext(StoreContext as React.Context<IStore<TState>>);

    const storage = useMemo(
        () => {
            console.log('%c storage-->', 'color: green', guid, services, selectors);
            return new Storage(
                services.map(([msg, service]) => [msg, service(store)]),
                selectors.map(([msg, selector]) => [msg, selector(store)]),
            )
        },
        [guid, store, services, selectors]
    );
    return storage;
};
