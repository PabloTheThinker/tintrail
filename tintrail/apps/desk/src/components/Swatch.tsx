type SwatchProps = {
  hex: string | null | undefined;
  title?: string;
  large?: boolean;
};

export function Swatch({ hex, title, large }: SwatchProps) {
  const missing = !hex;
  return (
    <span
      className={`swatch${large ? " lg" : ""}${missing ? " empty" : ""}`}
      style={missing ? undefined : { background: hex }}
      title={title ?? hex ?? "no preview"}
      aria-hidden={title ? undefined : true}
    />
  );
}
