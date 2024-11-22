export default function formatBar(
    progress: number,
    options: any // Replace `any` with the actual type of options
): string {
    const completeSize = Math.round(progress * options.barsize);
    const incompleteSize = options.barsize - completeSize;

    // Generate bar string by stripping the pre-rendered strings
    return (
        options.barCompleteString.substr(0, completeSize) +
        options.barGlue +
        options.barIncompleteString.substr(0, incompleteSize)
    );
}
