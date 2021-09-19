import React from 'react';

import Workspace from './workspace';
import { useStore } from './rxRedux/storeContext';
import { initialState } from './rxRedux/controls';

const ResultWorkspace: React.FC = () => {
    const [store, StoreContextProvider] = useStore(initialState, []);
    return <StoreContextProvider value={ store }>
        <Workspace />
    </StoreContextProvider>;
};

export default ResultWorkspace;
