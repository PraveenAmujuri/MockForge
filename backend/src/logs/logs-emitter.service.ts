import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface LogEvent {
  projectId: string;
  log: any;
}

@Injectable()
export class LogsEmitterService {
  private logSubject = new Subject<LogEvent>();

  emit(projectId: string, log: any) {
    this.logSubject.next({ projectId, log });
  }

  getObservable() {
    return this.logSubject.asObservable();
  }
}
