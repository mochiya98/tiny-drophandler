export type DropFileEntry = {
  fullPath: string;
  file: File;
};
export type AttachDropHandlerOptions = {
  target?: HTMLElement;
  onDrop: (files: DropFileEntry[]) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
};

const standardAPIAvailable = "getAsEntry" in DataTransferItem.prototype;

async function handleEntry(
  entry: FileSystemEntry,
  files: { [key: string]: File }
): Promise<void> {
  const fullPath = entry.fullPath.slice(1);
  if (entry.isFile) {
    const file = await new Promise<File>((resolve) => {
      (entry as FileSystemFileEntry).file(resolve);
    });
    files[fullPath] = file;
  } else if (entry.isDirectory) {
    delete files[fullPath];
    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    let entries: FileSystemEntry[];
    do {
      entries = await new Promise((resolve, reject) => {
        dirReader.readEntries((entries) => resolve(entries), reject);
      });
      for (const entry of entries) {
        await handleEntry(entry, files);
      }
    } while (entries.length > 0);
  }
}

export const attachDropHandler = ({
  target = document.documentElement,
  onDrop,
  onDragOver,
  onDragLeave,
}: AttachDropHandlerOptions) => {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    onDragOver && onDragOver(e);
  };
  const handleDragLeave = (e: DragEvent) => {
    onDragLeave && onDragLeave(e);
  };
  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    onDragLeave && onDragLeave(e);
    if (!e.dataTransfer) return;

    const items = e.dataTransfer.items;
    let files: { [key: string]: File } = Object.fromEntries(
      Array.from(e.dataTransfer.files).map((file) => [file.name, file])
    );

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry =
            //@ts-ignore
            item[standardAPIAvailable ? "getAsEntry" : "webkitGetAsEntry"](); // Use webkitGetAsEntry for directory support
          if (entry && !entry.isFile) await handleEntry(entry, files);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    const result = Object.entries(files).map(([fullPath, file]) => ({
      file,
      fullPath,
    }));
    result.length !== 0 && onDrop(result);
  };
  target.addEventListener("dragover", handleDragOver);
  target.addEventListener("dragleave", handleDragLeave);
  target.addEventListener("drop", handleDrop);
  return () => {
    target.removeEventListener("dragover", handleDragOver);
    target.removeEventListener("dragleave", handleDragLeave);
    target.removeEventListener("drop", handleDrop);
  };
};
