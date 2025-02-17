import {
  animate,
  AnimationTriggerMetadata,
  query,
  sequence,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const inOutAnimation = trigger('inOutAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('0.5s ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('0.2s ease-in', style({ opacity: 0 })),
  ]),
]);

export function FadeInOut(
  timingIn: number,
  timingOut: number,
  height: boolean = false
): AnimationTriggerMetadata {
  return trigger('fadeInOut', [
    transition(':enter', [
      style(height ? { opacity: 0, height: 0 } : { opacity: 0 }),
      animate(
        timingIn,
        style(height ? { opacity: 1, height: 'fit-content' } : { opacity: 1 })
      ),
    ]),
    transition(':leave', [
      animate(
        timingOut,
        style(height ? { opacity: 0, height: 0 } : { opacity: 0 })
      ),
    ]),
  ]);
}
