import React from 'react'
import { MagnetCornerType, MagnetCornerFrameBlockProps } from '@designer-core/shared/types';


const getCornerMarker = (type: MagnetCornerType, indent: [number, number, number, number], offset?: number) => {

    const [TOP_INDENT, RIGHT_INDENT, BOTTOM_INDENT, LEFT_INDENT] = indent;

    let props: Partial<React.CSSProperties> = { width: 20, height: 20 };
    const topLeftCorner: Partial<React.CSSProperties> = { borderTopStyle: 'solid', borderLeftStyle: 'solid' };
    const topRightCorner: Partial<React.CSSProperties> = { borderTopStyle: 'solid', borderRightStyle: 'solid' };
    const bottomLeftCorner: Partial<React.CSSProperties> = { borderBottomStyle: 'solid', borderLeftStyle: 'solid' };
    const bottomRightCorner: Partial<React.CSSProperties> = { borderBottomStyle: 'solid', borderRightStyle: 'solid' };

    const edgeStyle: Partial<React.CSSProperties> = { borderColor: 'lime' };

    const verticalLine: Partial<React.CSSProperties> = offset ? { borderLeftStyle: 'solid' } : { borderRightStyle: 'solid' };
    const horizontalLine: Partial<React.CSSProperties> = offset ? { borderBottomStyle: 'solid' } : { borderTopStyle: 'solid' };

    let helperOffset = {};

    switch (type) {

        case MagnetCornerType.TopLeft_LeftBottom:
            props = { ...props, ...topRightCorner, left: -LEFT_INDENT - 20, top: 0 };
            break;
        case MagnetCornerType.TopLeft_LeftTop:
            props = { ...props, ...bottomRightCorner, left: -LEFT_INDENT - 20, top: -20 };
            break;
        case MagnetCornerType.TopLeft_TopLeft:
            props = { ...props, ...bottomRightCorner, left: -20, top: -TOP_INDENT - 20 };
            break;
        case MagnetCornerType.TopLeft_TopRight:
            props = { ...props, ...bottomLeftCorner, left: 0, top: -TOP_INDENT - 20 };
            break;

        case MagnetCornerType.TopRight_TopLeft:
            props = { ...props, ...bottomRightCorner, right: 0, top: -TOP_INDENT - 20 };
            break;
        case MagnetCornerType.TopRight_TopRight:
            props = { ...props, ...bottomLeftCorner, right: -20, top: -TOP_INDENT - 20 };
            break;
        case MagnetCornerType.TopRight_RightTop:
            props = { ...props, ...bottomLeftCorner, right: -RIGHT_INDENT - 20, top: -20 };
            break;
        case MagnetCornerType.TopRight_RightBottom:
            props = { ...props, ...topLeftCorner, right: -RIGHT_INDENT - 20, top: 0 };
            break;


        case MagnetCornerType.BottomRight_RightTop:
            props = { ...props, ...bottomLeftCorner, right: -RIGHT_INDENT - 20, bottom: 0 };
            break;
        case MagnetCornerType.BottomRight_RightBottom:
            props = { ...props, ...topLeftCorner, right: -RIGHT_INDENT - 20, bottom: -20 };
            break;
        case MagnetCornerType.BottomRight_BottomRight:
            props = { ...props, ...topLeftCorner, right: -20, bottom: -BOTTOM_INDENT - 20 };
            break;
        case MagnetCornerType.BottomRight_BottomLeft:
            props = { ...props, ...topRightCorner, right: 0, bottom: -BOTTOM_INDENT - 20 };
            break;


        case MagnetCornerType.BottomLeft_BottomRight:
            props = { ...props, ...topLeftCorner, left: 0, bottom: -BOTTOM_INDENT - 20 };
            break;
        case MagnetCornerType.BottomLeft_BottomLeft:
            props = { ...props, ...topRightCorner, left: -20, bottom: -BOTTOM_INDENT - 20 };
            break;
        case MagnetCornerType.BottomLeft_LeftBottom:
            props = { ...props, ...topRightCorner, left: -LEFT_INDENT - 20, bottom: -20 };
            break;
        case MagnetCornerType.BottomLeft_LeftTop:
            props = { ...props, ...bottomRightCorner, left: -LEFT_INDENT - 20, bottom: 0 };
            break;


        case MagnetCornerType.Left_Vertical:
            helperOffset = offset ? { width: 1, top: -TOP_INDENT + 5 } : { width: 1, bottom: -BOTTOM_INDENT + 5 };
            props = { ...props, ...edgeStyle, ...verticalLine, left: 0, ...helperOffset };
            break;

        case MagnetCornerType.Right_Vertical:
            helperOffset = offset ? { width: 1, top: -TOP_INDENT + 5 } : { width: 1, bottom: -BOTTOM_INDENT + 5 };
            props = { ...props, ...edgeStyle, ...verticalLine, right: 0, ...helperOffset };
            break;

        case MagnetCornerType.Top_Horizontal:
            helperOffset = offset ? { height: 1, left: -LEFT_INDENT + 5 } : { height: 1, right: -RIGHT_INDENT + 5 };
            props = { ...props, ...edgeStyle, ...horizontalLine, top: 0, ...helperOffset };
            break;

        case MagnetCornerType.Bottom_Horizontal:
            helperOffset = offset ? { height: 1, left: -LEFT_INDENT + 5 } : { height: 1, right: -RIGHT_INDENT + 5 };
            props = { ...props, ...edgeStyle, ...horizontalLine, bottom: 0, ...helperOffset };
            break;

        case MagnetCornerType.None:
            props.width = 0;
            props.height = 0;
            props.top = 0;
            props.left = 0;
            break;

        default:
            props.width = 0;
            props.height = 0;
            props.top = 0;
            props.left = 0;
    }

    return { ...props };
};


const MagnetCornerFrameDiv = (props: MagnetCornerFrameBlockProps) => {

    const { type, indent, offset } = props;

    const cornerProps: Partial<React.CSSProperties> = type !== null
        ? getCornerMarker(type, indent, offset)
        : { top: 0, left: 0, width: 0, height: 0 };

    return <div className={ `block_magnet-corner-frame` } style={ { ...cornerProps } }></div>
}

export default MagnetCornerFrameDiv;
