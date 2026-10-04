/** One positioned text run from a PDF page. Coordinates are in PDF points, y measured from the top of the page. */
export interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface PageInfo {
  page: number;
  width: number;
  height: number;
}

export type Role = 'number' | 'start' | 'end' | 'duration' | 'title' | 'other';

export interface Column {
  name: string;
  /** What the parser thinks this column holds; the user can override it. */
  guess: Role;
}

export interface ParsedTable {
  /** 'columns' when a header row was found, 'lines' for the line-based fallback. */
  mode: 'columns' | 'lines';
  /** Suggested sequence name (largest heading on page 1), if any. */
  title?: string;
  columns: Column[];
  /** One entry per programme item; each cell may span several lines joined with '\n'. */
  rows: string[][];
}
