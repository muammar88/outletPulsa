import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * Mengubah parameter URL menjadi bilangan bulat positif.
 * Menolak nilai non-numerik, nol, dan bilangan negatif dengan HTTP 400.
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('ID harus berupa bilangan bulat positif.');
    }
    return parsed;
  }
}