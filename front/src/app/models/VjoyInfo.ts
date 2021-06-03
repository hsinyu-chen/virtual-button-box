import { Detail } from "./Detail";
import { Vjoy } from "./Vjoy";


export interface VjoyInfo {
    installed: boolean;
    vjoys: Vjoy[];
    details: Detail[];
    map: { [id: number]: Detail };
}
