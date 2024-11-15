type DropFileEntry = {
    fullPath: string;
    file: File;
};
type AttachDropHandlerOptions = {
    target?: HTMLElement;
    onDrop: (files: DropFileEntry[]) => void;
    onDragOver?: (event: DragEvent) => void;
    onDragLeave?: (event: DragEvent) => void;
};
declare const attachDropHandler: ({ target, onDrop, onDragOver, onDragLeave, }: AttachDropHandlerOptions) => () => void;

export { type AttachDropHandlerOptions, type DropFileEntry, attachDropHandler };
