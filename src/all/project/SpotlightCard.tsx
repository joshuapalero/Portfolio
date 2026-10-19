import { type ReactNode, type HTMLAttributes } from 'react';
import './SpotlightCard.css';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  layer1Content?: ReactNode;
  layer2Content?: ReactNode;
  layer3Content?: ReactNode;
  layer4Content?: ReactNode;
  layer5Content?: ReactNode;
}

/**
 * Uiverse.io Card Fan-out Animation by Javierrocadev
 * Houses all projects consecutively across the 5 layers:
 * Layer 5 (front surface) -> Layer 4 -> Layer 3 -> Layer 2 -> Layer 1 (deepest layer).
 */
export function SpotlightCard({
  children,
  className = '',
  layer1Content,
  layer2Content,
  layer3Content,
  layer4Content,
  layer5Content,
  style,
  ...props
}: SpotlightCardProps) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      <div className="pentagon1 card-layer-1">
        {layer1Content}
      </div>
      <div className="pentagon2 card-layer-2">
        {layer2Content}
      </div>
      <div className="pentagon3 card-layer-3">
        {layer3Content}
      </div>
      <div className="pentagon4 card-layer-4">
        {layer4Content}
      </div>
      <div className="pentagon5 card-layer-5 card-front-content">
        {layer5Content ?? children}
      </div>
    </div>
  );
}

export default SpotlightCard;
