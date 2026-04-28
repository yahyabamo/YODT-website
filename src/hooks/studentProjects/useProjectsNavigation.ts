import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Detects how the user entered Student Projects (from public index or authenticated home)
 * and provides a context-aware goBack() function.
 * Entry points must pass ?ref=public or ?ref=home when linking to /student-projects.
 * The ref is persisted in sessionStorage so sub-pages (detail) keep context.
 */
export function useProjectsNavigation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === 'public' || ref === 'home') {
      sessionStorage.setItem('student_projects_ref', ref);
    }
    if (!ref && !sessionStorage.getItem('student_projects_ref')) {
      sessionStorage.setItem('student_projects_ref', 'public');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getRef = () => sessionStorage.getItem('student_projects_ref') ?? 'public';

  const isFromHome = () => getRef() === 'home';

  const goBack = () => {
    if (isFromHome()) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return { goBack, isFromHome };
}
