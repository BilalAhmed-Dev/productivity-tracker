import dynamic from 'next/dynamic';

import ProductivityTracker from '@/components/ProductivityTracker';

// Use dynamic import with no SSR to avoid localStorage hydration issues

/**
 * The main page component that renders the ProductivityTracker component.
 *
 * @returns {JSX.Element} The rendered ProductivityTracker component.
 */
const Page = () => {
    return <ProductivityTracker />;
};

export default Page;
