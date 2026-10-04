import JSZip from 'jszip';

export const MACRO_DIR = 'grandMA3/gma3_library/datapools/macros';

/** ZIP with the folder structure ready to unpack at the root of a USB stick. */
export async function buildZip(fileSlug: string, xml: string): Promise<Blob> {
  const zip = new JSZip();
  zip.file(`${MACRO_DIR}/${fileSlug}.xml`, xml);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}
