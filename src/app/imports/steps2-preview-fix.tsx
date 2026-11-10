 IZMJENA 1: DesignCanvasStep - Preview Rendering
LOKACIJA: /components/visualizer/Steps2.tsx - linije 969-984

❌ ZAMIJENI OVO:
{objects.map((obj) => (
  <img
    key={obj.id}
    src={obj.imageUrl}
    alt={obj.name}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      pointerEvents: 'none',
    }}
  />
))}
✅ SA OVIM:
{objects.map((obj) => {
  // Calculate scale factor (canvas pixel size vs display size)
  const canvas = canvasRef.current;
  const displayWidth = canvas?.getBoundingClientRect().width || spaceCropCanvasSize?.width || 800;
  const canvasPixelWidth = spaceCropCanvasSize?.width || 800;
  const scale = displayWidth / canvasPixelWidth;

  return (
    <img
      key={obj.id}
      src={obj.imageUrl}
      alt={obj.name}
      style={{
        position: 'absolute',
        left: `${obj.position.x * scale}px`,
        top: `${obj.position.y * scale}px`,
        width: `${obj.displayWidth * scale}px`,
        height: `${obj.displayHeight * scale}px`,
        transform: `rotate(${obj.rotation}deg)`,
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}
    />
  );
})}
🎯 TO JE SVE!
Ova jedna izmjena će riješiti problem gdje se transformirani bazen ne prikazuje u preview-u.

📍 GDJE TOČNO:
Otvori /components/visualizer/Steps2.tsx
Scroll na liniju 969 (ili traži {objects.map((obj) =>)
Zamijeni kod od linije 969 do 984
Save
✅ ŠTO ĆE OVO POPRAVITI:
Preview će pokazati TOČNU poziciju objekta (ne više uvijek 0,0)
Preview će pokazati TOČNU veličinu (ne više 100% container-a)
Preview će odgovarati finalnom output-u iz handleFinish()