import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Detects how the user entered the store (from public index or authenticated home)
 * and provides a context-aware goBack() function.
 *
 * Entry points must pass ?ref=public or ?ref=home when linking to /store.
 * The ref is persisted in sessionStorage so sub-pages (product detail) keep context.
 */
export function useStoreNavigation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // On first render, capture and persist the ref param
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === 'public' || ref === 'home') {
      sessionStorage.setItem('store_ref', ref);
    }
    // If no ref and nothing stored yet, default to public
    if (!ref && !sessionStorage.getItem('store_ref')) {
      sessionStorage.setItem('store_ref', 'public');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getRef = () => sessionStorage.getItem('store_ref') ?? 'public';

  const isFromHome = () => getRef() === 'home';

  const goBack = () => {
    if (isFromHome()) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const goBackToStore = () => {
    navigate('/store');
  };

  return { goBack, goBackToStore, isFromHome };
}
