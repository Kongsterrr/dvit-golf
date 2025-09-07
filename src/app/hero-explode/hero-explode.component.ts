import {
  AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy,
  PLATFORM_ID, ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-explode',
  standalone: true,
  templateUrl: './hero-explode.component.html',
  styleUrls: ['./hero-explode.component.scss'],
})
export class HeroExplodeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scene',  { static: true }) scene!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private st?: any;            // ScrollTrigger instance
  private gsap!: any;          // gsap module
  private ScrollTrigger!: any; // ScrollTrigger plugin

  // ==== CONFIG (edit here) ====
  private readonly FRAMES_DIR = 'assets/images/';
  private readonly PAD = 4;            // zero padding -> 0001..0005
  private readonly EXT = 'webp';       // change if you use png/jpg
  private readonly FRAME_START = 1;
  private readonly FRAME_END   = 5;    // <-- set to your last frame number
  private readonly CROSSFADE   = false; // false = hard cut per frame (fast)
  private readonly SCROLL_PER_FRAME = 80; // px of scroll per frame
  private readonly ZOOM_DELTA  = 0.04; // tiny zoom amount (0.04 = 4%)

  private readonly INTRO_ZOOM_START = 0.7; // where the intro zoom begins
  private readonly INTRO_PAUSE_MS   = 400; 
  private readonly INTRO_FADE_MS    = 1200;  // canvas fade-in duration
  private readonly INTRO_ZOOM_MS    = 1200;  // intro zoom duration
  // ============================

  private images: HTMLImageElement[] = [];  // 1-indexed by frame number
  private ctx!: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { default: gsap } = await import('gsap');
    const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    this.gsap = gsap;
    this.ScrollTrigger = ScrollTrigger;

    this.zone.runOutsideAngular(async () => {
      await this.preloadFrames();
      this.setupCanvas();

      const totalFrames = this.FRAME_END - this.FRAME_START + 1;

      // First paint (respect reduced motion: jump to last frame)
      // const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // this.drawFrame(prefersReduced ? this.FRAME_END : this.FRAME_START);

      // --- First paint & one-time intro animation ---
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // draw first frame so it’s ready when we reveal the canvas
      this.drawFrame(this.FRAME_START);

      const canvasEl = this.canvasRef.nativeElement;
      const root = document.documentElement as any;

      // start variables
      this.gsap.set(root, {
        '--intro-zoom': prefersReduced ? 1 : this.INTRO_ZOOM_START,
        '--scroll-zoom': 1, // scroll-driven zoom starts neutral
      });

      // show canvas (optional quick fade if you set INTRO_FADE_MS)
      if (this.INTRO_FADE_MS > 0 && !prefersReduced) {
        this.gsap.set(canvasEl, { opacity: 0 });
        this.gsap.to(canvasEl, { opacity: 1, duration: this.INTRO_FADE_MS / 1000, ease: 'power2.out' });
      } else {
        canvasEl.style.opacity = '1';
      }

      // play intro only if not reduced motion: hold small, then zoom to 1
      if (!prefersReduced) {
        const tlIntro = this.gsap.timeline();
        tlIntro.to({}, { duration: this.INTRO_PAUSE_MS / 1000 }); // pause at small size
        tlIntro.to(root, {
          '--intro-zoom': 1,
          duration: this.INTRO_ZOOM_MS / 1000,
          ease: 'power2.out',
        });
      }



      // Intro zoom
      // Compute scroll distance
      const scrollLen = Math.max(this.SCROLL_PER_FRAME * (totalFrames - 1), 1000);

      this.st = ScrollTrigger.create({
        trigger: this.scene.nativeElement,
        start: 'top top',
        end: `+=${scrollLen}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.2,           // light smoothing (prevents jitter)
        anticipatePin: 1,
        // snap to exact frame boundaries on release
        snap: {
          snapTo: (value: number) => {
            const f = value * (totalFrames - 1);
            return Math.round(f) / (totalFrames - 1);
          },
          duration: 0.15,
          ease: 'power1.inOut',
          inertia: false
        },
        onUpdate: (self: any) => {
          const p = self.progress; // 0..1
          const fExact = this.FRAME_START + p * (totalFrames - 1);
          if (this.CROSSFADE) {
            const i = Math.floor(fExact);
            const t = fExact - i;
            this.drawCrossfade(i, Math.min(i + 1, this.FRAME_END), t);
          } else {
            this.drawFrame(Math.round(fExact));
          }
          // tiny zoom like your original HTML
          // this.gsap.set(document.documentElement as any, { '--zoom': 1 + this.ZOOM_DELTA * p });
          this.gsap.set(document.documentElement as any, { '--scroll-zoom': 1 + this.ZOOM_DELTA * p });
        },
        // onEnter:     () => this.drawFrame(this.FRAME_END),
        // onEnterBack: () => this.drawFrame(this.FRAME_START),
      });


      // Keep canvas crisp on resize/DPR changes
      const onResize = () => { this.setupCanvas(); this.ScrollTrigger.refresh(); };
      window.addEventListener('resize', onResize, { passive: true });
      (this.st as any)._onResize = onResize;

      
      // --- Callouts image reveal ---
      const infoEl = this.infoSection.nativeElement;
      const overlayImg = infoEl.querySelector('.callout-overlay') as HTMLImageElement;

      this.gsap.set(overlayImg, { opacity: 0});

      this.ScrollTrigger.create({
        trigger: infoEl,
        start: 'top 70%',
        onEnter: (self: any) => {
          this.gsap.to(overlayImg, {
            delay: 0.5,           // wait 0.5s
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          });
          self.disable();         // play once
        },
      });
      



    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.st) {
      const onResize = (this.st as any)._onResize as (() => void) | undefined;
      if (onResize) window.removeEventListener('resize', onResize);
      this.st.kill();
      this.st = undefined;
    }
  }

  // ===== helpers =====

  private async preloadFrames(): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (let n = this.FRAME_START; n <= this.FRAME_END; n++) {
      const src = `${this.FRAMES_DIR}${String(n).padStart(this.PAD, '0')}.${this.EXT}`;
      tasks.push(new Promise<void>((resolve) => {
        const im = new Image();
        im.onload = im.onerror = () => resolve();
        im.src = src;
        this.images[n] = im; // store by frame number (1..N)
      }));
    }
    await Promise.all(tasks);
    // allow layout to settle, then refresh pin spacing
    requestAnimationFrame(() => this.ScrollTrigger.refresh());
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    const cw = parent.clientWidth;
    const ch = parent.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    if (canvas.width !== Math.floor(cw * dpr) || canvas.height !== Math.floor(ch * dpr)) {
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      this.dpr = dpr;
      this.ctx = canvas.getContext('2d')!;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    }
  }

  private drawFrame(frameNum: number): void {
    if (frameNum < this.FRAME_START) frameNum = this.FRAME_START;
    if (frameNum > this.FRAME_END)   frameNum = this.FRAME_END;

    const im = this.images[frameNum];
    if (!im) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    // clear
    ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr);

    // contain: fit full image in canvas
    const { dx, dy, dw, dh } = this.containRect(
      im.naturalWidth, im.naturalHeight,
      canvas.clientWidth, canvas.clientHeight,
      this.getScaleForFrame(frameNum)
    );
    ctx.globalAlpha = 1;
    ctx.drawImage(im, dx, dy, dw, dh);
  }

  private drawCrossfade(aFrame: number, bFrame: number, t: number): void {
    if (aFrame < this.FRAME_START) aFrame = this.FRAME_START;
    if (bFrame > this.FRAME_END)   bFrame = this.FRAME_END;

    const a = this.images[aFrame];
    const b = this.images[bFrame];
    if (!a) return this.drawFrame(bFrame);

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    const rectA = this.containRect(a.naturalWidth, a.naturalHeight, canvas.clientWidth, canvas.clientHeight, this.getScaleForFrame(aFrame));

    ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr);

    // draw A
    ctx.globalAlpha = 1;
    ctx.drawImage(a, rectA.dx, rectA.dy, rectA.dw, rectA.dh);

    // draw B blended on top
    if (b) {
      const rectB = (b === a) ? rectA
        : this.containRect(b.naturalWidth, b.naturalHeight, canvas.clientWidth, canvas.clientHeight, this.getScaleForFrame(bFrame));
      ctx.globalAlpha = Math.max(0, Math.min(1, t));
      ctx.drawImage(b, rectB.dx, rectB.dy, rectB.dw, rectB.dh);
      ctx.globalAlpha = 1;
    }
  }

  // compute a "contain" rectangle (like object-fit: contain)
  private containRect(
    srcW: number, srcH: number,
    dstW: number, dstH: number,
    scale: number
  ) {
    const srcRatio = srcW / srcH;
    const dstRatio = dstW / dstH;
    let dw = dstW, dh = dstH, dx = 0, dy = 0;
  
    if (srcRatio > dstRatio) {
      dw = dstW; dh = Math.round(dstW / srcRatio);
      dx = 0; dy = Math.round((dstH - dh) / 2);
    } else {
      dh = dstH; dw = Math.round(dstH * srcRatio);
      dy = 0; dx = Math.round((dstW - dw) / 2);
    }
  
    // apply frame-specific scale and re-center
    const s = Math.max(0.01, scale); // guard against 0/negative
    if (s !== 1) {
      const dw2 = Math.round(dw * s);
      const dh2 = Math.round(dh * s);
      dx += Math.round((dw - dw2) / 2);
      dy += Math.round((dh - dh2) / 2);
      dw = dw2; dh = dh2;
    }
    return { dx, dy, dw, dh };
  }

  private readonly DEFAULT_FIT_SCALE = 0.85;

  // per-frame overrides (frameNo: scale). Example values:
  private readonly FRAME_SCALES: Record<number, number> = {
    1: 0.5,
    2: 0.5,
    3: 0.51,
    4: 0.55,
    5: 0.65,
  };

  private getScaleForFrame(frameNum: number): number {
    return this.FRAME_SCALES[frameNum] ?? this.DEFAULT_FIT_SCALE;
  }

  @ViewChild('infoSection', { static: true }) infoSection!: ElementRef<HTMLElement>;


  
}
