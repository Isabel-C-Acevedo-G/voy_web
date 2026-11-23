import { Component, computed, input, model } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 10;

export function pageSlice<T>(items: readonly T[], page: number, size = DEFAULT_PAGE_SIZE): T[] {
  const p = Math.max(1, page);
  const start = (p - 1) * size;
  return items.slice(start, start + size);
}

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly total = input.required<number>();
  readonly pageSize = input(DEFAULT_PAGE_SIZE);
  readonly page = model(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  readonly from = computed(() => {
    if (this.total() === 0) {
      return 0;
    }
    return (this.page() - 1) * this.pageSize() + 1;
  });

  readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  prev(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  next(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }
}
