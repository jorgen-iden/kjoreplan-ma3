import data from './ma-versions.json';

export interface MaVersion {
  id: string;
  label: string;
  /** Written to the DataVersion attribute of the XML header. */
  dataVersion: string;
  /** Name of the menu used to import, shown in the import instructions. */
  importMenu: string;
}

export const MA_VERSIONS: MaVersion[] = data.versions;
export const DEFAULT_MA_VERSION = MA_VERSIONS[0];

export function findVersion(id: string | undefined): MaVersion {
  return MA_VERSIONS.find((v) => v.id === id) ?? DEFAULT_MA_VERSION;
}
