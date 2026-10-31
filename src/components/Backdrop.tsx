/** Soft animated pastel blobs behind everything. */
export function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-[#ffd3e8] blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-1/3 -right-40 size-[30rem] rounded-full bg-[#e3d6ff] blur-3xl opacity-70 animate-blob [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/4 size-[28rem] rounded-full bg-[#d4ecff] blur-3xl opacity-60 animate-blob [animation-delay:-12s]" />
      <div className="absolute inset-0 bg-[radial-gradient(#e9d4ec_1px,transparent_1px)] [background-size:22px_22px] opacity-50" />
    </div>
  )
}
