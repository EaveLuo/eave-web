# Skill: Optimize FCP Performance

When user asks to improve First Contentful Paint (FCP) or page performance:

## Analysis Steps

1. Run Lighthouse audit
2. Check Vercel Speed Insights
3. Identify bottlenecks

## Common Optimizations

### 1. Lazy Load Heavy Components

```tsx
// Before
import Particles from './particles';

// After
const [show, setShow] = useState(false);
useEffect(() => {
  requestAnimationFrame(() => setShow(true));
}, []);

return show && <Particles />;
```

### 2. Optimize Animations

```tsx
// Before: Spring animations (slower)
transition: { type: 'spring', delay: i * 0.2 }

// After: Tween animations (faster)
transition: { type: 'tween', ease: 'easeOut', delay: i * 0.1 }
```

### 3. Compress Assets

```bash
# Compress SVGs
svgo static/img/**/*.svg

# Expected: 30-50% size reduction
```

### 4. Preload Critical Resources

```typescript
// docusaurus.config.ts
headTags: [
  {
    tagName: 'link',
    attributes: {
      rel: 'preload',
      href: '/img/hero.svg',
      as: 'image',
    },
  },
]
```

## Performance Goals

- FCP: < 2.0s
- LCP: < 2.5s
- CLS: < 0.1

## Measurement

- Chrome DevTools → Lighthouse
- Vercel Dashboard → Analytics → Speed Insights
- Web Vitals browser extension

## Success Criteria

- Measurable improvement in Lighthouse score
- No visual regression
- Maintained functionality
