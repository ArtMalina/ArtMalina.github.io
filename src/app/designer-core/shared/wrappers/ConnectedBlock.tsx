import React, { useEffect, useState, useMemo } from 'react';
import { BoxProps, BaseBoxProps } from '../types';


/**
 * @function BlockWrapper provides mapping stream datas to simple Position, XY, Size
 * @param Block simple Block gets base properties (xy, position, etc) 
 */
export const WrappedBlock = (Block: React.ComponentType<BaseBoxProps>) => {

    const Result = <TProps extends BoxProps>(props: React.PropsWithChildren<TProps>) => {

        const { guid, size$, position$, xy$, activeLevel$, ...otherProps } = props;

        const [xy, setXY] = useState(xy$.getValue());
        const [position, setPosition] = useState(position$.getValue());
        const [size, setSize] = useState(size$.getValue());
        const [activeLevel, setActiveLevel] = useState(activeLevel$.getValue());


        useEffect(() => {
            const xySub = xy$.subscribe(([x, y]) => {
                requestAnimationFrame(() => {
                    setXY([x, y]);
                });
            });
            const positionSub = position$.subscribe(([x, y]) => {
                requestAnimationFrame(() => {
                    setPosition([x, y]);
                });
            });
            const sizeSub = size$.subscribe(([sx, sy]) => {
                requestAnimationFrame(() => {
                    setSize([sx, sy]);
                });
            });

            const activeLevelSub = activeLevel$.subscribe((level) => {
                requestAnimationFrame(() => {
                    setActiveLevel(level);
                });
            });

            return () => {
                console.log('unsubscribe WrappedBlock', guid);
                positionSub.unsubscribe();
                xySub.unsubscribe();
                sizeSub.unsubscribe();
                activeLevelSub.unsubscribe();
            };

        }, [guid, size$, position$, xy$, activeLevel$]);

        return <Block { ...otherProps } guid={ guid } xy={ xy } position={ position } size={ size } activeLevel={ activeLevel } >
            { props.children }
        </Block>;
    };

    return Result;
}

/**
 * ConnectedBlock provides sending BACK to position$ captured xy stream data and fix started position
 * @param BoxBlock simple Block gets base properties (xy, position, etc) 
 */
const ConnectedBlock = (BoxBlock: React.ComponentType<BaseBoxProps>) => {

    const ResultComponent = <TProps extends BoxProps>(props: React.PropsWithChildren<TProps>) => {

        const { guid, size$, position$, xy$, activeLevel$, ...otherProps } = props;

        const size = size$.getValue();
        const activeLevel = activeLevel$.getValue();
        const position = useMemo(() => position$.getValue(), [position$]);

        const [xy, setXY] = useState(xy$.getValue());

        useEffect(() => {
            const xySub = xy$.subscribe(([x, y]) => {
                requestAnimationFrame(() => {
                    position$.next([x, y]);
                    setXY([x, y]);
                });
            });
            return () => {
                console.log('unsubscribe ConnectedBlock', guid);
                xySub.unsubscribe();
            };
        }, [guid, position$, xy$]);

        return <BoxBlock { ...otherProps } guid={ guid } xy={ xy } position={ position } size={ size } activeLevel={ activeLevel } >
            { props.children }
        </BoxBlock>;
    };

    return ResultComponent;
}
export default ConnectedBlock;
