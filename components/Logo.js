export default function Logo({ size=36 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-accent text-black font-bold grid place-items-center" style={{width:size, height:size}}>
        CS
      </div>
      <span className="font-semibold">Chimney Solutions</span>
    </div>
  );
}
