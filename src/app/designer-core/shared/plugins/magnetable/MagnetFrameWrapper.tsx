import React, { useEffect, useState } from 'react';
import { BoxProps, MagnetFrameProps, MagnetCornerProps, MagnetCornerType } from '@designer-core/shared/types';

import MagnetFrameBlock from '@designer-core/shared/blocks/MagnetFrame';

import MagnetCornerFrameBlock from '@designer-core/shared/blocks/MagnetCornerFrame';
import { useSubscribedState } from '@designer-core/shared/helpers/storage';

const [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT] = [30, 50, 30, 50];

export const CAPTURE_DELTA = 80;
export const Indents: [number, number, number, number] = [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT];

const MagnetWrapper = <TProps extends BoxProps>(Component: React.ComponentType<TProps>) => {
    const ResultBlock = (props: React.PropsWithChildren<MagnetFrameProps & MagnetCornerProps & TProps>) => {

        const { guid, position$, xy$, markerPosition$, size$, nearestFrame$ } = props;

        const [markerValue, setMarkerValue] = useState(markerPosition$.getValue());

        const [size] = useSubscribedState(size$);
        const [nearestFrame] = useSubscribedState(nearestFrame$);

        useEffect(() => {
            const markerSub = markerPosition$.subscribe(data => {
                if (data && data[1] === 1) {
                    xy$.next([data[0][0], data[0][1]])
                }
                setMarkerValue(data);
            });
            return () => markerSub.unsubscribe();
        }, [guid, markerPosition$, xy$, position$]);


        const edges = [MagnetCornerType.Left_Vertical, MagnetCornerType.Right_Vertical, MagnetCornerType.Top_Horizontal, MagnetCornerType.Bottom_Horizontal];
        const isCorner = nearestFrame && edges.indexOf(nearestFrame.magnetType) < 0;
        const isEdge = nearestFrame && edges.indexOf(nearestFrame.magnetType) > -1;

        return (
            <React.Fragment>
                <MagnetFrameBlock size={ [size[0], size[1]] } markerPosition={ markerValue } />
                {
                    isEdge && <MagnetCornerFrameBlock
                        type={ nearestFrame ? nearestFrame.magnetType : null }
                        offset={ 0 }
                        indent={ [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT] } />
                }
                {
                    isEdge && <MagnetCornerFrameBlock
                        type={ nearestFrame ? nearestFrame.magnetType : null }
                        offset={ 1 }
                        indent={ [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT] } />
                }
                {
                    isCorner && <MagnetCornerFrameBlock
                        type={ nearestFrame ? nearestFrame.magnetType : null }
                        indent={ [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT] } />
                }
                <Component { ...props }>
                    { props.children }
                </Component>
            </React.Fragment>
        );
    };
    return ResultBlock;
}

export default MagnetWrapper;
