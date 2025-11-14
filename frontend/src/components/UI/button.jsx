import React from 'react';

const sizes = {
	sm: 'px-3 py-1 text-sm',
	md: 'px-4 py-2',
	lg: 'px-6 py-3 text-lg',
};

export const Button = ({ children, className = '', size = 'md', variant = 'solid', ...props }) => {
	const base = 'inline-flex items-center justify-center rounded-md font-medium';
	const sizeClass = sizes[size] || sizes.md;
	const variantClass = variant === 'outline' ? 'border border-current bg-transparent' : 'bg-primary text-white';

	return (
		<button className={`${base} ${sizeClass} ${variantClass} ${className}`} {...props}>
			{children}
		</button>
	);
};

export default Button;
