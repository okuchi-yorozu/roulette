import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';

interface Name {
  id: string;
  value: string;
}

const NameRoulette: React.FC = () => {
  const [names, setNames] = useState<Name[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  const spinTimeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setNames([
        ...names,
        {
          id: crypto.randomUUID(),
          value: newName.trim(),
        },
      ]);
      setNewName('');
    }
  };

  const handleRemoveName = (id: string) => {
    const newNames = names.filter((name) => name.id !== id);
    setNames(newNames);
  };

  const spin = () => {
    if (names.length < 2) return;

    setIsSpinning(true);
    // 初期速度を上げる（30 → 45）
    let speed = 45;
    // 減速率を小さくする（1.02 → 1.008）でよりゆっくり減速
    let slowdown = 1.008;
    let currentRotation = rotation;

    const animate = () => {
      currentRotation += speed;
      speed = speed / slowdown;
      setRotation(currentRotation);

      // 停止速度の条件を小さくする（0.5 → 0.2）でより長く回る
      if (speed > 0.2) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        const actualRotation = currentRotation % 360;
        const sectionSize = 360 / names.length;
        const selectedIndex = Math.floor(
          ((360 - actualRotation) % 360) / sectionSize
        );

        setRotation(currentRotation);
        setSelectedIndex(selectedIndex);
        setIsSpinning(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  // 各セクションの色を交互に変えるための関数
  const getSectionColor = (index: number) => {
    return index % 2 === 0 ? '#f0f9ff' : 'white';
  };

  // 円形のセクションを描画するSVGパスを生成する関数
  const createSectorPath = (index: number, total: number): string => {
    const angle = 360 / total;
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;

    const start = {
      x: 200 + 180 * Math.cos((startAngle - 90) * (Math.PI / 180)),
      y: 200 + 180 * Math.sin((startAngle - 90) * (Math.PI / 180)),
    };

    const end = {
      x: 200 + 180 * Math.cos((endAngle - 90) * (Math.PI / 180)),
      y: 200 + 180 * Math.sin((endAngle - 90) * (Math.PI / 180)),
    };

    const largeArc = angle > 180 ? 1 : 0;

    return `M 200 200 L ${start.x} ${start.y} A 180 180 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <form onSubmit={handleAddName} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="名前を入力"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </form>

      <div className="relative aspect-square">
        {/* SVG全体のコンテナ */}
        <svg className="h-full w-full" viewBox="0 0 400 400">
          {/* 回転するルーレット部分 */}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
            }}
          >
            {names.map((name, index) => {
              const angle = (360 / names.length) * index + 180 / names.length;
              return (
                <g key={name.id}>
                  <path
                    d={createSectorPath(index, names.length)}
                    fill={getSectionColor(index)}
                    stroke="#e5e7eb"
                    className={
                      selectedIndex === index && !isSpinning
                        ? 'fill-yellow-100'
                        : ''
                    }
                  />
                  <text
                    x="200"
                    y="200"
                    fill="black"
                    fontSize="16"
                    textAnchor="middle"
                    transform={`
                rotate(${angle}, 200, 200)
                translate(0, -100)
              `}
                  >
                    {name.value}
                  </text>
                </g>
              );
            })}
            {/* 中心点 */}
            <circle cx="200" cy="200" r="5" fill="black" />
          </g>

          {/* 固定の矢印（回転しない） */}
          <path
            d="M 200 30 L 190 10 L 210 10 Z"
            fill="red"
            className="origin-center"
          />
        </svg>
      </div>
      <div className="space-y-2">
        {/* 名前リスト */}
        <div className="flex flex-wrap gap-2">
          {names.map((name) => (
            <div
              key={name.id}
              className={`flex items-center gap-2 rounded border px-3 py-1 ${
                selectedIndex === names.findIndex((n) => n.id === name.id) &&
                !isSpinning
                  ? 'bg-yellow-100'
                  : 'bg-white'
              }`}
            >
              {name.value}
              <button
                onClick={() => handleRemoveName(name.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || names.length < 2}
          className={`w-full rounded py-3 font-bold ${
            isSpinning || names.length < 2
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isSpinning ? '回転中...' : '開始'}
        </button>

        {names.length < 2 && (
          <p className="text-center text-sm text-red-500">
            ※ルーレットを開始するには2名以上必要です
          </p>
        )}
      </div>
    </div>
  );
};

export default NameRoulette;
