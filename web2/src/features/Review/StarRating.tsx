import React from 'react';

interface StarRatingProps {
  value: number;       // 0–5, supports decimals for display
  size?: 'sm' | 'md' | 'lg';
  interactive?: false;
}

interface InteractiveStarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  interactive: true;
  onChange: (rating: number) => void;
}

type Props = StarRatingProps | InteractiveStarRatingProps;

const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };

const StarRating: React.FC<Props> = (props) => {
  const { value, size = 'sm' } = props;
  const isInteractive = props.interactive === true;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => {
              if (isInteractive && 'onChange' in props) props.onChange(star);
            }}
            className={`${isInteractive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'} bg-transparent border-none p-0`}
            aria-label={`${star} star`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${sizeMap[size]} transition-colors`}
              fill={filled ? '#f59e0b' : half ? 'url(#half)' : 'none'}
              stroke={filled || half ? '#f59e0b' : '#cbd5e1'}
              strokeWidth="1.5"
            >
              {half && (
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
