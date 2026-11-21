// String of lights (plus a few swinging ornaments) hanging from the bottom edge of the header.
export default function Lights({ ornaments }: { ornaments: boolean }) {
  return (
    <div className="xm-lights" aria-hidden="true">
      <div className="xm-row">
        {Array.from({ length: 48 }).map((_, i) =>
          i % 6 === 3 ? (
            <span key={i} className="xm-cell">
              <svg className="xm-star" viewBox="0 0 24 24" style={{ ["--d" as string]: `${(i * 0.41) % 3}s` }}><path fill="currentColor" d="M12 2l2.6 6.4 6.9.5-5.3 4.5 1.7 6.7L12 16.4 6.1 20.1l1.7-6.7L2.5 8.9l6.9-.5z" /></svg>
            </span>
          ) : (
            <span key={i} className={`xm-cell c${i % 5}`}>
              <i className="xm-bulb" style={{ ["--d" as string]: `${(i * 0.37) % 2.6}s` }} />
            </span>
          )
        )}
      </div>
      <div className={`xm-orns ${ornaments ? "" : "xm-gone"}`}>
        <div className="xm-orn c0" style={{ left: "24%", ["--len" as string]: "36px", ["--d" as string]: "-1s" }}><i /><b /></div>
        <div className="xm-orn c1 xm-hide-sm" style={{ left: "58%", ["--len" as string]: "46px", ["--d" as string]: "-2.4s" }}><i /><b /></div>
        <div className="xm-orn c2" style={{ left: "90%", ["--len" as string]: "34px", ["--d" as string]: "-0.2s" }}><i /><b /></div>
      </div>
    </div>
  );
}
