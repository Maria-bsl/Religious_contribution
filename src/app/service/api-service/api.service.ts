import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}
  addLogin(params: any): Observable<any> {
    return this.http.post<any>(`/Loginnew/addLogin`, params, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  otpCode(params: any): Observable<any> {
    return this.http.post<any>(`/OtpCode/addLogin`, params, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  resendOtpCode(params: any): Observable<any> {
    return this.http.post<any>(`/OtpCode/addLogresend`, params, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  resetPassword(params: any): Observable<any> {
    return this.http.post<any>(`/Getemail/Forgot`, params, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
