import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { Settings } from "./Settings";
import { debounceTime } from 'rxjs/operators';
import { Layout } from "../models/Layout";
export class AppSettings {
    oledProtect = true;
    layouts: Layout[] = []
    enableVibrate = true;
}
@Injectable({
    providedIn: 'root'
})
export class App {
    settings = new AppSettings();
    currentSettings = new BehaviorSubject<AppSettings>(null);
    constructor(private s: Settings) {
        s.getAsync<AppSettings>('app').then(v => {
            for (const k of Object.keys(this.settings)) {
                this.settings[k] = v[k] === undefined ? this.settings[k] : v[k];
            }
            this.makeNotifyChange();
            this.currentSettings.next(this.settings);
        });
    }
    async saveChanges() {
        if (this.savingTask) {
            await this.savingTask;
        }
        this.savingTask = this.s.updateAsync('app', Object.assign({}, this.proxy)).finally(() => this.savingTask = null);
        this.currentSettings.next(this.settings);
    }
    savingTask: Promise<any>;
    proxy: any = {}
    makeNotifyChange() {
        const changed = new Subject<string>();
        const p = Object.getOwnPropertyNames(this.settings);
        for (const k of p) {
            this.proxy[k] = this.settings[k];
            delete this.settings[k];
            Object.defineProperty(this.settings, k, {
                set: value => {
                    this.proxy[k] = value;
                    changed.next(k);
                },
                get: () => this.proxy[k]
            })
        }
        changed.pipe(debounceTime(1)).subscribe(async () => {
            await this.saveChanges();
        })
    }

}