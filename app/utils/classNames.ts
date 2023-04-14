export const classNames = (...args: (string | undefined | boolean)[]) =>
  args.filter((arg) => arg).join(" ");
