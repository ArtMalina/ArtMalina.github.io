import React, { Fragment, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Props as ControlProps } from './Control';
import { Position } from '@designer-core/shared/types';


export interface Props {
    component: React.ComponentType<ControlProps>,
    controls$: BehaviorSubject<ControlProps[]>,
    offsetPosition$: BehaviorSubject<Position>;
}

const Container: React.FC<Props> = (props: Props) => {

    const { component: ControlComponent, controls$ } = props;

    const [controls, setControls] = useState<ControlProps[]>([]);

    useEffect(() => {
        const controlsSub = controls$.pipe().subscribe(items => {
            setControls([...items]);
        });
        return () => controlsSub.unsubscribe();
    }, [controls$]);

    return <Fragment>
        {
            controls.map(t => <ControlComponent key={ `${t.guid}-${t.name}` } { ...t } />)
        }
    </Fragment>
};

export default Container;
