import { Axis, AxisBindingType } from "../models/Axis";
import { IVjoyBinding } from "./IVjoyBinding";

export interface IVjoyButtonBinding extends IVjoyBinding {
    buttonId?: number;
}
export interface IVjoyAxisBinding extends IVjoyBinding {
    axis?: Axis;
    type?: AxisBindingType
}
