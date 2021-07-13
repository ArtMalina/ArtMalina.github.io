export enum RendererType {
    HTML = '<HTML>',
    SVG = '<SVG>',
    CANVAS_2D = 'CANVAS_2D',
    WEBGL = 'WEBGL'
}

export enum BlockType {
    Anchor = 'Anchor',
    Box = 'Box',
    Container = 'Container',
    DragFrame = 'DragFrame',
    MagnetCornerFrame = 'MagnetCornerFrame',
    MagnetBorderFrame = 'MagnetBorderFrame',
    SelectedFrame = 'SelectedFrame'
}

export interface ContainerProps {
    setRef?: (ref: HTMLDivElement | null) => void,
    style?: React.CSSProperties;
    handlers?: React.DOMAttributes<HTMLDivElement>;
    classModifiers?: string[];
}
