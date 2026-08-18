/**
 * Brand marks from theSVG (thesvg.org), mono variants. Paths are verbatim;
 * the fill is `currentColor` so they take the surrounding text colour.
 * LinkedIn ships no mono variant upstream — this is its default path with the
 * hardcoded #0A66C2 fill dropped.
 *
 * The path data is exported on its own as well, because `ParticleIcon`
 * rasterises it into an offscreen buffer rather than rendering this SVG. Both
 * readings of a mark therefore come from one string.
 */

export type BrandMark = {
  /** The whole mark as a single path, nonzero winding — the SVG default. */
  path: string;
  /** Side of the mark's square viewBox. */
  viewBox: number;
};

export const GMAIL_MARK: BrandMark = {
  viewBox: 24,
  path: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
};

export const LINKEDIN_MARK: BrandMark = {
  viewBox: 256,
  path: "M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453",
};

export const X_MARK: BrandMark = {
  viewBox: 24,
  path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
};

type BrandIconProps = {
  size?: number;
  className?: string;
};

function BrandIcon({
  mark,
  size = 18,
  className = "",
}: BrandIconProps & { mark: BrandMark }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${mark.viewBox} ${mark.viewBox}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={mark.path} />
    </svg>
  );
}

export function GmailIcon(props: BrandIconProps) {
  return <BrandIcon mark={GMAIL_MARK} {...props} />;
}

export function LinkedInIcon(props: BrandIconProps) {
  return <BrandIcon mark={LINKEDIN_MARK} {...props} />;
}

export function XIcon(props: BrandIconProps) {
  return <BrandIcon mark={X_MARK} {...props} />;
}
