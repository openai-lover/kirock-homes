/** Decorative optical sweep. Both images use the same full-viewport cover crop. */
export default function OpeningLens() {
  return <div className="opening-investigation" aria-hidden="true" data-testid="opening-investigation">
    <img className="opening-desk" src="/sample-desk.jpg" alt="" width={1100} height={1659}/>
    <div className="opening-magnifier" data-testid="opening-magnifier">
      <div className="opening-lens-handle"/>
      <div className="opening-lens-glass">
        <img className="opening-lens-photo" src="/sample-desk.jpg" alt="" width={1100} height={1659}/>
        <span className="opening-lens-glint"/>
      </div>
    </div>
  </div>;
}
