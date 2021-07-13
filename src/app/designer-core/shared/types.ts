import { Subject, BehaviorSubject } from 'rxjs';
import { CSSProperties } from 'react';

export const SELECTING_FRAME_GUID = 'selecting-frame';
export const ROOT_GUID = 'root';


export type Nullable<T> = T | null;

export type ContextPlugin<TMouseContext, TPartContext> = [TPartContext, (mouseContext: TMouseContext) => [React.EffectCallback, React.DependencyList]];


export enum ActiveLevels {
    None = '<none>',
    Hover = '<hover>',
    InGroup = '<in-group>',
    HoverInGroup = '<hover-in-group>',
    JustMove = '<just-move(?)>',
    MoveByHand = '<move-by-hand>',
    MoveByHandInGroup = '<move-by-hand-in-group>',
    MoveInGroup = '<move-in-group>',
    // Resize = '<resize>',
    // ResizeInGroup = '<resize-in-group>'
}

export enum ActiveLevelStatus {
    None = 0,
    /**
     *  component is moving
     */
    JustMove = 1,
    /**
     * component is selecting (by hover, for example. NOT IN LASSO)
     */
    JustActive = 2,
    /**
     * component is in group
     */
    InGroup = 3,
    /**
     *  grouped component is moving by hand
     */
    MoveAndSelect = 4,
    /**
     * component is moving as part of moving group
     */
    MoveInGroup = 5,
    /**
     * component is resizing
     */
    Resize = 6
}

export type Position = [number, number];


interface BaseProps {
    guid: any;

    style?: CSSProperties;
    classModifiers?: string[];
    classElements?: string[];
    classBlocks?: string[];
    handlers?: React.DOMAttributes<HTMLElement>;
}

export interface BaseBoxProps extends BaseProps {
    position: Position;
    size: Position;
    xy: Position;
    activeLevel: ActiveLevels;
};

export interface BoxProps extends BaseProps {
    /**
     * real changing coords
     */
    xy$: BehaviorSubject<Position>;
    /**
     * calculated position stream (may set to empty-stream by wrapping)
     */
    offsetPosition$: BehaviorSubject<Position>;

    position$: BehaviorSubject<Position>;
    size$: BehaviorSubject<Position>;

    activeLevel$: BehaviorSubject<ActiveLevels>;
}

export interface DragFrameProps {
    activeLevel$: BehaviorSubject<ActiveLevels>;
}

export interface DragFrameBlockProps {
    activeLevel: ActiveLevels;
}

export type ComponentWrapper<TCompProps, TResultProps> = (Component: React.ComponentType<TCompProps>) => React.ComponentType<TResultProps>;

export type ComponentContextWrapper<TCompProps, TResultProps, TContext> = (
    Component: React.ComponentType<TCompProps>,
    Context: React.Context<TContext>
) => React.ComponentType<TResultProps>;


export type MagnetMarkerPosition = [Position, number];

export interface MagnetFrameProps {
    markerPosition$: BehaviorSubject<Nullable<MagnetMarkerPosition>>;
    // size: Position;
}

export interface MagnetFrameBlockProps {
    markerPosition: Nullable<MagnetMarkerPosition>;
    size: Position;
}

export enum MagnetCornerType {
    TopLeft = '<TopLeft>',
    TopLeft_TopLeft = '<TopLeft-TopLeft>',
    TopLeft_TopRight = '<TopLeft-TopRight>',
    TopLeft_LeftTop = '<TopLeft-LeftTop>',
    TopLeft_LeftBottom = '<TopLeft-LeftBottom>',

    TopRight = '<TopRight>',
    TopRight_TopLeft = '<TopRight-TopLeft>',
    TopRight_TopRight = '<TopRight-TopRight>',
    TopRight_RightTop = '<TopRight-RightTop>',
    TopRight_RightBottom = '<TopRight-RightBottom>',

    BottomRight = '<BottomRight>',
    BottomRight_RightTop = '<BottomRight-RightTop>',
    BottomRight_RightBottom = '<BottomRight-RightBottom>',
    BottomRight_BottomRight = '<BottomRight-BottomRight>',
    BottomRight_BottomLeft = '<BottomRight-BottomLeft>',

    BottomLeft = '<BottomLeft>',
    BottomLeft_BottomRight = '<BottomLeft-BottomRight>',
    BottomLeft_BottomLeft = '<BottomLeft-BottomLeft>',
    BottomLeft_LeftBottom = '<BottomLeft-LeftBottom>',
    BottomLeft_LeftTop = '<BottomLeft-LeftTop>',

    Left_Vertical = '<left-vertical>',
    Right_Vertical = '<right-vertical>',

    Top_Horizontal = '<top-horizontal>',
    Bottom_Horizontal = '<bottom-horizontal>',


    RightTop = '<RightTop>',
    RightBottom = '<RightBottom>',
    LeftTop = '<LeftTop>',
    LeftBottom = '<LeftBottom>',
    None = '<None>',
    // TopRight = 0,
    // TopLeft = 1,
    // BottomRight = 2,
    // BottomLeft = 3,
    // RightTop = 4,
    // RightBottom = 5,
    // LeftTop = 6,
    // LeftBottom = 7,
}

export type LinePosition = [Position, Position];

export type NearestFrame = { frame: LinePosition, fix: GuidType, magneted: GuidType, magnetType: MagnetCornerType };

export interface MagnetCornerProps {
    nearestFrame$: BehaviorSubject<Nullable<NearestFrame>>;
}

export interface MagnetCornerFrameBlockProps {
    offset?: number;
    type: MagnetCornerType | null;
    indent: [number, number, number, number];
}


export enum EventType {
    StartDrag = 'StartDrag',
    DragInGroup = 'DragInGroup',
    Move = 'Move',
    Resize = 'Resize',
    StopResize = 'StopResize',
    StopDrag = 'StopDrag',
    Cancel = 'Cancel',
    StartSelecting = 'StartSelecting',
    StopSelecting = 'StopSelecting'
}

export type GuidType = Nullable<string>;

export interface IStreamData {
    type: EventType;
    ev: MouseEvent;
    elementId: GuidType;
}

export interface IStreamControlData {
    elementId: GuidType;
}

export interface IObservablesMouse {
    mouseDown: Subject<IStreamData>;
    mouseMove: Subject<IStreamData>;
    mouseUp: Subject<IStreamData>;
    mouseLeave: Subject<IStreamData>;
    mouseStop: Subject<IStreamData>;
};


export interface IObservableDeltaMoves {
    deltaMoves: Subject<[GuidType, Position]>;
}

export interface IObservableControl {
    control: BehaviorSubject<GuidType>;
    group: BehaviorSubject<GuidType[]>;
}

export interface IObservablesDrag {
    dragStart: Subject<IStreamData>;
    dragStop: Subject<IStreamData>;
    drag: Subject<IStreamData>;
}

export interface ILassoStreamData {
    start: Position;
    end: Position;
    trapped: GuidType[];
}

export enum TrappedType {
    In = 1,
    Out = -1
}

export interface ITrappedItem {
    guid: GuidType;
    trappedType: TrappedType;
}

export interface IObservableLasso {
    // for capturing corners of the lasso frame
    lasso: Subject<ILassoStreamData>;
    trapping: Subject<ITrappedItem[]>;
    trapped: BehaviorSubject<GuidType[]>;
}



export enum MagnetPairDirection {
    In = 1,
    Out = -1
}

export interface IMagnetPairIn {
    items: [GuidType, GuidType];
    type: MagnetCornerType;
    direction: MagnetPairDirection.In;
}

export interface IMagnetPairOut {
    items: [GuidType];
    direction: MagnetPairDirection.Out;
}

export type IMagnetPair = IMagnetPairIn | IMagnetPairOut;

export interface IMagnetStreamData {
    magneted: [GuidType, GuidType];
    type: MagnetCornerType;
}

export type IMouseStreamContext =
    IObservablesMouse
    & IObservableDeltaMoves
    & IObservableControl
    & IObservablesDrag;
// & IObservableLasso;

export enum MouseButtonType {
    Left = 0,
    Middle = 1,
    Right = 2
}

export type PropertyType<TObject extends {}, TProp extends keyof TObject> = TObject[TProp];
