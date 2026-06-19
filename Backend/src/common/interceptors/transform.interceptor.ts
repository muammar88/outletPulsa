import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((res) => {
        let message = 'Success';
        let data: any = null;
        let errorStatus: any = '';

        // kalau return object custom
        if (res && typeof res === 'object') {
          message = res.message || message;
          // jika respons punya format legacy, kita konversi juga
          if (res.error_msg) {
             message = res.error_msg;
          }
          if (res.error !== undefined) {
             errorStatus = res.error;
          }
          data = res.data !== undefined ? res.data : res;
          
          // hapus duplikasi message & error_msg di data jika res adalah data itu sendiri
          if (data && typeof data === 'object') {
             if (data.message === message) delete data.message;
             if (data.error_msg) delete data.error_msg;
             if (data.error !== undefined) delete data.error;
          }
          
          if (!data || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
             data = {};
          }
        } else {
          data = res !== undefined && res !== null ? res : {};
        }

        return {
          error: errorStatus,
          message,
          data: data !== null ? data : {},
        };
      }),
    );
  }
}
