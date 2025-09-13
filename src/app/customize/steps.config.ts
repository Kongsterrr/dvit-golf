export type StepKey = 'face' | 'weighting'; // add more as you grow

export interface StepOption {
  id: string;
  name: string;
  overlay: string;
  price: number;
  tagline?: string;
}

export interface StepConfig {
  key: StepKey;
  title: string;
  sub: string;
  base?: string;
  options: StepOption[];

  artScale?: number;
  artOffsetY?: number;

  backTo?: StepKey; // 👈 step keys, not URLs
  nextTo?: StepKey; // 👈
}

export const STEPS: Record<StepKey, StepConfig> = {
  face: {
    key: 'face',
    title: 'Face Deck',
    sub: '选择你的击球面材质与纹理',
    options: [
      { id: '303',    name: '303 实心精铣', overlay: 'assets/customize/face/303.png',    price: 0,  tagline: '清脆音色、线性回弹' },
      { id: '6061',   name: '6061 铝面',     overlay: 'assets/customize/face/6061.png',   price: 0,  tagline: '柔和手感、轻声' },
      { id: 'copper', name: '铜面',          overlay: 'assets/customize/face/copper.png', price: 30, tagline: '厚实回馈、偏软' },
      { id: 'poly',   name: '聚合物复合',     overlay: 'assets/customize/face/polymer.png',price: 20, tagline: '高摩擦、滚动启动快' },
    ],
    artScale: 0.68,
    artOffsetY: -8,
    backTo: undefined,        // first step has no back
    nextTo: 'weighting',      // 👈 go to weighting
  },

  weighting: {
    key: 'weighting',
    title: 'Weighting',
    sub: '选择后部尾翼长度',
    options: [
      { id: 'short', name: '短尾翼', overlay: 'assets/customize/weighting/shortwing.png', price: 0 },
      { id: 'long',  name: '长尾翼', overlay: 'assets/customize/weighting/longwing.png',  price: 20 },
    ],
    artScale: 0.6,
    artOffsetY: -8,
    backTo: 'face',           // 👈 back to face
    nextTo: undefined,        // set later (e.g., 'connector')
  },
};
