import React from 'react'
import { MagnetFrameBlockProps } from '@designer-core/shared/types';

const MagnetFrameDiv = <TProps extends MagnetFrameBlockProps>(props: TProps) => {

    const { markerPosition, size } = props;
    return <div
        className={ `block_magnet-frame block_magnet-frame--${!markerPosition || markerPosition[1] ? 'disabled' : 'active'}` }
        style={ {
            marginTop: -40,
            marginLeft: -40,
            width: size[0] + 80,
            height: size[1] + 80,
        } }></div>
}

export default MagnetFrameDiv;
