import { Nullable, GuidType, MagnetCornerType, Position } from '@designer-core/shared/types';

export type GuidSizePosition = { guid: GuidType, position: Position, size: Position };

export type NearestResult = [GuidType, Position, Position, MagnetCornerType];

export type Indents = [number, number, number, number];


export type CornerData = [MagnetCornerType, GuidSizePosition];
export type ClosestData = [number, Nullable<CornerData>, Nullable<CornerData>, MagnetCornerType];
