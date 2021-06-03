import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder, IRetryPolicy } from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { Axis } from "../models/Axis";
import { VjoyInfo } from "../models/VjoyInfo";
export class InfiniteRetryPolicy implements IRetryPolicy {
    constructor() { }
    nextRetryDelayInMilliseconds(retryContext: signalR.RetryContext): number | null {
        return 5000;
    }
}
@Injectable({
    providedIn: 'root'
})
export class VjoyService {
    vjoyInfo: VjoyInfo;
    hub: HubConnection;
    isConnected = new BehaviorSubject<boolean>(false);
    connected = false;
    constructor(private http: HttpClient) {
        this.isConnected.subscribe(v => {
            if (v) {
                this.http.post('/api/vjoy/hw/claim', {}).subscribe(() => { })
            }
        });
        this.hub = new HubConnectionBuilder()
            .withUrl('/api/ws/command')
            .withAutomaticReconnect(new InfiniteRetryPolicy())
            .build();
        this.hub.onreconnected(() => {
            this.connected = true;
            this.isConnected.next(true);
        });
        this.hub.onclose(() => {
            this.connected = false;
            this.isConnected.next(false)
        });
        this.hub.start().then(() => {
            this.connected = true;
            this.isConnected.next(true);
        });
    }
    setButtonState(device: number, button: number, pressed: boolean) {
        if (this.connected) {
            return this.hub.send('setButton', device, button, pressed);
        }
        console.warn('hub not connected');
        return Promise.resolve();
    }
    setAxisState(device: number, axis: Axis, value: number) {
        if (this.connected) {
            return this.hub.send('setAxis', device, axis, value);
        }
        console.warn('hub not connected');
        return Promise.resolve();
    }
    update() {
        return new Promise<void>(ok => {
            this.http.get('/api/vjoy').subscribe(x => {
                this.vjoyInfo = x as any;
                this.vjoyInfo.map = {};
                this.vjoyInfo.details.forEach(d => {
                    d.buttonList = [];
                    this.vjoyInfo.map[d.id] = d;
                    for (let i = 1; i < d.buttons; i++) {
                        d.buttonList.push(i);
                    }
                })
                ok();
            });
        });
    }
}
