import { Directive, Injectable, Input, Output, Type } from "@angular/core";
@Directive()
export abstract class ControlComponentBase {
    constructor(panel: Panel) {

    }
}
@Directive()
export abstract class ControlSettongComponentBase<T> {
    constructor(public settings: T) {

    }
}
@Injectable()
export class ControlDefine {
    constructor(public componentType: Type<ControlComponentBase>,
        public settingComponentType: Type<ControlSettongComponentBase<any>>,
        public settingType: Type<any>,
        public name: string) { }
}
@Injectable()
export class Panel {
    constructor(public editing: boolean) {

    }
}