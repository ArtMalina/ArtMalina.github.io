import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { Props as ControlsCntProps } from '@designer-core/workspace/Controls/Controls';

import { SelectorMap } from '../../storeTypes';
import { combineSelectors } from '../../helpers';
import { ActiveLevels } from '@designer-core/shared/types';
import { ControlProps } from '@designer-core/workspace/Controls/Control/ControlBlock';

const ControlsMapper: SelectorMap<IState, ControlsCntProps> = (state, props) => {

    // const [addx, addy] = props.offsetPosition$.getValue();

    // props.controls.next(state.controls$.getValue().map<ControlProps>(t => ({
    //     guid: t.guid,
    //     name: `${t.uiType}-${t.guid}`,

    //     activeLevel$: new BehaviorSubject<ActiveLevels>(ActiveLevels.None),
    //     xy$: new BehaviorSubject([t.position[0], t.position[1]]),
    //     position$: new BehaviorSubject([t.position[0], t.position[1]]),
    //     size$: new BehaviorSubject([t.size[0], t.size[1]]),

    //     style: t.style,

    //     offsetPosition$: new BehaviorSubject([t.position[0] + addx, t.position[1] + addy]),
    // })));
};


const selector = (state: IState, props: ControlsCntProps) =>
    combineSelectors<IState, IControlData[], ControlsCntProps>(state.controls$, 'controls', [ControlsMapper])(state, props);


export default selector;
