import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Rocket, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

// ==================== 3D Components ====================

function FloatingSphere({ position, scale, speed, color }: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.1;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.35}
          distort={0.4}
          speed={2}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00C389"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#00C389" />

      <FloatingSphere position={[-3, 1.5, -2]} scale={1.2} speed={1.2} color="#00C389" />
      <FloatingSphere position={[3.5, -1, -3]} scale={0.8} speed={0.8} color="#00a876" />
      <FloatingSphere position={[0, 2.5, -4]} scale={1.5} speed={0.6} color="#011B33" />
      <FloatingSphere position={[-4, -2, -1]} scale={0.6} speed={1.5} color="#00C389" />
      <FloatingSphere position={[5, 0.5, -5]} scale={1} speed={1} color="#00a876" />

      <Particles count={100} />
    </>
  );
}

// ==================== Countdown Logic ====================

const LAUNCH_DATE = new Date("2026-06-01T00:00:00");

const calculateTimeLeft = (target: Date) => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

// ==================== Page Component ====================

const ComingSoon = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(LAUNCH_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Minutos" },
    { value: timeLeft.seconds, label: "Segundos" },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 1.5]}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[1] bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Icon */}
          <motion.div
            className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </motion.div>

          {/* Title */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight">
              Em breve{" "}
              <span className="text-primary">disponível</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Estamos preparando uma experiência incrível para conectar você aos melhores profissionais da sua região.
            </p>
          </div>

          {/* Countdown */}
          <motion.div
            className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Lançamento previsto
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {timeUnits.map((unit, i) => (
                <motion.div
                  key={unit.label}
                  className="bg-primary/5 border border-primary/10 rounded-2xl p-3 sm:p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-3xl sm:text-5xl md:text-6xl font-black text-primary leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    {unit.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Em breve você poderá contratar serviços com total segurança e praticidade.
            Profissionais verificados, pagamento seguro e atendimento rápido.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="hero"
              size="xl"
              className="group text-base px-8 py-5 h-auto"
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document.getElementById("seja-profissional")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Sou profissional, quero me cadastrar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="text-base px-8 py-5 h-auto border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao site
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
