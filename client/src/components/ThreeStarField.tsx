import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random';

function Stars(props: any) {
  const ref = useRef<any>();
  
  // Generate 5000 stars in a sphere
  const [positions] = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);
    
    // Generate random positions in a sphere
    const sphere = random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 });
    
    // Copy positions
    for (let i = 0; i < positions.length; i++) {
      positions[i] = sphere[i];
    }
    
    return [positions];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function ThreeStarField() {
  return (
    <div className="fixed inset-0 z-[-1] bg-slate-950">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  );
}
