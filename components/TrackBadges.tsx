const tracks = ["Know Your Rights", "The Negotiator", "Paperwork Crusher"];

export function TrackBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((track) => (
        <span key={track} className="status-pill normal-case tracking-normal">
          {track}
        </span>
      ))}
    </div>
  );
}
