import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class Settings {
    constructor(private http: HttpClient) {

    }
    getAsync<T>(key: string): Promise<T> {
        return new Promise((ok, rej) => {
            this.http.get(`/api/settings/${key}`).subscribe(response => ok(response as T), rej);
        });
    }
    updateAsync<T>(key: string, data: T): Promise<void> {
        return new Promise((ok, rej) => {
            this.http.put(`/api/settings/${key}`, data).subscribe(response => ok(), rej);
        });
    }
}