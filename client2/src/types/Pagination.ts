export interface Pagination<T = any> {
  count: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
  results: T[];
}
