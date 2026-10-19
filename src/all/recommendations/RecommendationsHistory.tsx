import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useActionState,
  useOptimistic,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  MessageSquarePlus,
  LayoutGrid,
} from 'lucide-react';
import { useSuspenseRecommendations, useAddRecommendation } from './queries';
import {
  type RecommendationComment,
  type RecommendationFormState,
  newRecommendationInputSchema,
  INITIAL_FORM_STATE,
  validateNameString,
  validateRoleString,
  validateCommentString,
  VERIFIED_ROLES,
} from './types';
import {
  getCommentAvatarUri,
  getSketchAvatarIndex,
  getAvatarDataUri,
} from './storage';
import { HistoryFooter } from '../ui';
import './recommendations.css';


export interface RecommendationsHistoryProps {
  readonly onBack?: () => void;
}

/**
 * Responsive column count for natural masonry flow:
 * Desktop: 3 columns (Left, Middle, Right)
 * Tablet: 2 columns
 * Mobile: 1 column
 */
function useColumnCount(): number {
  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(max-width: 560px)').matches) return 1;
    if (window.matchMedia('(max-width: 860px)').matches) return 2;
    return 3;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqlSmall = window.matchMedia('(max-width: 560px)');
    const mqlMedium = window.matchMedia('(max-width: 860px)');

    const updateCount = () => {
      if (mqlSmall.matches) {
        setColumnCount(1);
      } else if (mqlMedium.matches) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    mqlSmall.addEventListener('change', updateCount);
    mqlMedium.addEventListener('change', updateCount);
    return () => {
      mqlSmall.removeEventListener('change', updateCount);
      mqlMedium.removeEventListener('change', updateCount);
    };
  }, []);

  return columnCount;
}

/**
 * Aurora Scharff Co-located Zero-CLS Recommendations Masonry Skeleton.
 */
export function RecommendationsHistorySkeleton({ columnCount = 3 }: { columnCount?: number }) {
  return (
    <div
      className="rec-cards-masonry rec-cards-skeleton-masonry"
      role="status"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      <span className="sr-only">Loading recommendations from community members...</span>
      {Array.from({ length: columnCount }).map((_, colIdx) => (
        <div key={colIdx} className="rec-cards-col">
          {Array.from({ length: 2 }).map((_, itemIdx) => (
            <div
              key={itemIdx}
              className="rec-card-item rec-skeleton-card"
              aria-hidden="true"
            >
              <div className="rec-card-header">
                <div className="rec-card-author-wrap">
                  <div className="rec-skeleton-avatar rec-skeleton-shimmer" />
                  <div className="rec-skeleton-user-info">
                    <div className="rec-skeleton-line rec-skeleton-name rec-skeleton-shimmer" />
                    <div className="rec-skeleton-line rec-skeleton-role rec-skeleton-shimmer" />
                    <div className="rec-skeleton-line rec-skeleton-date rec-skeleton-shimmer" />
                  </div>
                </div>
              </div>
              <div className="rec-skeleton-body">
                <div
                  className="rec-skeleton-line rec-skeleton-text rec-skeleton-shimmer"
                  style={{ width: itemIdx % 2 === 0 ? '95%' : '88%' }}
                />
                <div
                  className="rec-skeleton-line rec-skeleton-text rec-skeleton-shimmer"
                  style={{ width: itemIdx % 2 === 0 ? '100%' : '92%' }}
                />
                <div
                  className="rec-skeleton-line rec-skeleton-text rec-skeleton-shimmer"
                  style={{ width: itemIdx % 2 === 0 ? '80%' : '65%' }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * RecommendationsHistory component adhering to:
 * - Brand new React 19.2 hooks: useActionState, useOptimistic, useTransition
 * - Aurora Scharff / TanStack Query v5 declarative design patterns
 * - 1-2-3 Left-to-Right masonry distribution filling vertical spaces
 */
export default function RecommendationsHistory({
  onBack,
}: RecommendationsHistoryProps) {
  // ── 1. TanStack Query v5 Authority State (Aurora Scharff declarative pattern) ─
  const {
    data: serverComments = [],
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useSuspenseRecommendations();
  const addMutation = useAddRecommendation();

  // Responsive column count for 1-2-3 Left-to-Right masonry distribution
  const columnCount = useColumnCount();

  // ── Maintain skeleton state for 5 seconds for visual inspection (Aurora Scharff pattern) ──
  const [minLoading, setMinLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setMinLoading(true);
    setTimeout(() => {
      setMinLoading(false);
    }, 2000);
    void refetch();
  };

  const showSkeleton = minLoading;

  // ── 2. React 19.2 useOptimistic Hook ──────────────────────────────────────────
  // Instantaneous 0ms UI update before async mutation resolves
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    serverComments,
    (currentList: readonly RecommendationComment[], newComment: RecommendationComment) => [
      newComment,
      ...currentList,
    ],
  );

  // ── 3. Form Ref & Open/Close State with Staggered Cascade Animation ──────
  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const roleInputRef = useRef<HTMLInputElement | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [formVisibility, setFormVisibility] = useState<'open' | 'opening' | 'closing' | 'closed'>('closed');
  const [btnAnimating, setBtnAnimating] = useState<boolean>(false);
  const btnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Playing Card Deck State ────────────────────────────────────────────────
  // Step 1: Name card (Only Name is visible)
  // Step 2: Role card (Card transition animation, Name is not visible)
  // Step 3: Comment card (Card transition animation, Role is not visible)
  // Step 4: Post card (Card transition animation, Review & Submit, Avatar is automatic without selector UI)
  const [currentCard, setCurrentCard] = useState<1 | 2 | 3 | 4>(1);
  const [cardDirection, setCardDirection] = useState<'forward' | 'backward'>('forward');
  const [formName, setFormName] = useState<string>('');
  const [formRole, setFormRole] = useState<string>('');
  const [formComment, setFormComment] = useState<string>('');

  useEffect(() => {
    return () => {
      if (btnTimerRef.current) clearTimeout(btnTimerRef.current);
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      if (openingTimerRef.current) clearTimeout(openingTimerRef.current);
    };
  }, []);

  const triggerButtonPop = () => {
    if (btnTimerRef.current) clearTimeout(btnTimerRef.current);
    setBtnAnimating(true);
    btnTimerRef.current = setTimeout(() => {
      setBtnAnimating(false);
      btnTimerRef.current = null;
    }, 450);
  };

  const isFormOpen = formVisibility === 'open' || formVisibility === 'opening';

  const handleToggleForm = () => {
    triggerButtonPop();
    if (isFormOpen) {
      if (openingTimerRef.current) clearTimeout(openingTimerRef.current);
      setFormVisibility('closing');
      closingTimerRef.current = setTimeout(() => {
        setFormVisibility('closed');
      }, 380);
    } else {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      // Reset card deck to Card 1 (Name) with playing card transition
      setCurrentCard(1);
      setCardDirection('forward');
      setNameClientError(null);
      setRoleClientError(null);
      setCommentClientError(null);
      setFormVisibility('opening');
      openingTimerRef.current = setTimeout(() => {
        setFormVisibility('open');
        nameInputRef.current?.focus();
      }, 540);
    }
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (formVisibility === 'closing') {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      setFormVisibility('closed');
    } else if (formVisibility === 'opening') {
      if (openingTimerRef.current) clearTimeout(openingTimerRef.current);
      setFormVisibility('open');
    }
  };

  const [nameClientError, setNameClientError] = useState<string | null>(null);
  const [roleClientError, setRoleClientError] = useState<string | null>(null);
  const [commentClientError, setCommentClientError] = useState<string | null>(null);

  // Automatic Avatar mapped deterministically from Name (No selector displayed)
  const activeAvatarIndex = getSketchAvatarIndex(formName);

  const formatCardDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const month = parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = parsed.getFullYear();
      return `${month}  ${year}`;
    }
    return dateStr.toUpperCase();
  };

  const goToNextCard = () => {
    if (currentCard === 1) {
      const err = validateNameString(formName);
      if (err) {
        setNameClientError(err);
        return;
      }
      setNameClientError(null);
      setCardDirection('forward');
      setCurrentCard(2);
      setTimeout(() => roleInputRef.current?.focus(), 250);
    } else if (currentCard === 2) {
      const err = validateRoleString(formRole);
      if (err) {
        setRoleClientError(err);
        return;
      }
      setRoleClientError(null);
      setCardDirection('forward');
      setCurrentCard(3);
      setTimeout(() => commentInputRef.current?.focus(), 250);
    } else if (currentCard === 3) {
      const err = validateCommentString(formComment);
      if (err) {
        setCommentClientError(err);
        return;
      }
      setCommentClientError(null);
      setCardDirection('forward');
      setCurrentCard(4);
    }
  };

  const goToPrevCard = () => {
    if (currentCard > 1) {
      setCardDirection('backward');
      const prev = (currentCard - 1) as 1 | 2 | 3 | 4;
      setCurrentCard(prev);
      setTimeout(() => {
        if (prev === 1) nameInputRef.current?.focus();
        if (prev === 2) roleInputRef.current?.focus();
        if (prev === 3) commentInputRef.current?.focus();
      }, 250);
    }
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const err = validateNameString(val);
    setNameClientError(err);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (nameClientError) {
      const err = validateNameString(val);
      setNameClientError(err);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToNextCard();
    }
  };

  const handleRoleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const err = validateRoleString(val);
    setRoleClientError(err);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormRole(val);
    if (roleClientError) {
      const err = validateRoleString(val);
      setRoleClientError(err);
    }
  };

  const handleRoleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToNextCard();
    }
  };

  const handleCommentBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const err = validateCommentString(val);
    setCommentClientError(err);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFormComment(val);
    if (commentClientError) {
      const err = validateCommentString(val);
      setCommentClientError(err);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      goToNextCard();
    }
  };

  // ── 4. React 19.2 useActionState for Form Action ─────────────────────────────
  // Encapsulates submission lifecycle, Zod validation, optimistic dispatch, and error recovery
  const [formState, formAction, isActionPending] = useActionState(
    async (
      _previousState: RecommendationFormState,
      formData: FormData,
    ): Promise<RecommendationFormState> => {
      const rawName = ((formData.get('name') as string) || '').trim();
      const rawRole = ((formData.get('role') as string) || '').trim();
      const rawDescription = ((formData.get('description') as string) || '').trim();
      const rawAvatarIndex = formData.get('avatarIndex');
      const parsedAvatarIndex =
        rawAvatarIndex !== null && rawAvatarIndex !== ''
          ? Number(rawAvatarIndex)
          : undefined;

      // 6a. Declarative Zod Schema Validation
      const validationResult = newRecommendationInputSchema.safeParse({
        name: rawName,
        role: rawRole,
        description: rawDescription,
        avatarIndex:
          parsedAvatarIndex !== undefined && !isNaN(parsedAvatarIndex)
            ? parsedAvatarIndex
            : undefined,
      });

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of validationResult.error.issues) {
          const key = String(issue.path[0] || 'description');
          if (!fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }

        setCurrentCard(4);
        return {
          status: 'error',
          message: validationResult.error.issues[0]?.message || 'Please check the form inputs.',
          fieldErrors,
          values: {
            name: rawName,
            role: rawRole,
            description: rawDescription,
            avatarIndex: parsedAvatarIndex,
          },
          timestamp: Date.now(),
        };
      }

      const validPayload = validationResult.data;

      // 6b. Optimistic Record for React 19 useOptimistic
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date());

      const assignedAvatarIndex =
        typeof validPayload.avatarIndex === 'number'
          ? validPayload.avatarIndex
          : getSketchAvatarIndex(validPayload.name);

      const optimisticRecord: RecommendationComment = {
        id: optimisticId,
        name: validPayload.name,
        role: validPayload.role,
        description: validPayload.description,
        date: formattedDate,
        createdAt: Date.now(),
        isOptimistic: true,
        avatarIndex: assignedAvatarIndex,
      };

      // Apply React 19 optimistic update instantly
      addOptimisticComment(optimisticRecord);

      // 6c. Execute TanStack Query v5 mutation
      try {
        await addMutation.mutateAsync(validPayload);

        // Reset inputs on success
        formRef.current?.reset();
        setNameClientError(null);
        setRoleClientError(null);
        setCommentClientError(null);
        setFormName('');
        setFormRole('');
        setFormComment('');
        setCurrentCard(1);
        setCardDirection('forward');

        return {
          status: 'success',
          message: 'Thank you! Your recommendation was posted live.',
          values: {
            name: '',
            role: '',
            description: '',
          },
          timestamp: Date.now(),
        };
      } catch (err) {
        setCurrentCard(4);
        return {
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to post recommendation.',
          values: {
            name: rawName,
            role: rawRole,
            description: rawDescription,
            avatarIndex: parsedAvatarIndex,
          },
          timestamp: Date.now(),
        };
      }
    },
    INITIAL_FORM_STATE,
  );

  // ── Sorted comments derived via useMemo (structural sharing) ─────────────────
  const sortedComments = useMemo(() => {
    return [...optimisticComments].sort((a, b) => b.createdAt - a.createdAt);
  }, [optimisticComments]);

  // ── 1-2-3 Left-to-Right Masonry Column Distribution ──────────────────────────
  // User instruction: "123 and so on count so i means start from left since there three card only so the next after 3 is start again in left"
  // Col 0: Card 1, Card 4, Card 7...
  // Col 1: Card 2, Card 5, Card 8...
  // Col 2: Card 3, Card 6, Card 9...
  const columns = useMemo(() => {
    const cols: RecommendationComment[][] = Array.from({ length: columnCount }, () => []);
    sortedComments.forEach((comment, index) => {
      cols[index % columnCount].push(comment);
    });
    return cols;
  }, [sortedComments, columnCount]);

  // ── 5. In-place Vertical Collapsible Cards State ─────────────────────────────
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const toggleCardExpanded = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };


  const activeNameError = nameClientError ?? formState.fieldErrors?.name;
  const activeRoleError = roleClientError ?? formState.fieldErrors?.role;
  const activeDescError = commentClientError ?? formState.fieldErrors?.description;

  return (
    <article className="rec-page-container" aria-label="Recommendations & Endorsements">
      {/* ── Back to home button ─────────────────────────────────────────── */}
      {onBack && (
        <button
          type="button"
          className="rec-back-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="rec-header">
        <div className="rec-header-top">
          <h1 className="rec-title">recommendations</h1>
          <div className="rec-toggle-wrapper">
            <button
              type="button"
              className={`rec-post-toggle-btn ${isFormOpen ? 'active' : ''}`}
              onClick={handleToggleForm}
              aria-expanded={isFormOpen}
              aria-label={isFormOpen ? 'Hide recommendation form' : 'Post recommendation'}
              title={isFormOpen ? 'Hide recommendation form' : 'Post recommendation'}
            >
              <LayoutGrid
                size={16}
                className={`rec-post-toggle-icon ${btnAnimating ? 'is-popping' : ''}`}
              />
            </button>
          </div>
        </div>
        <p className="rec-subtitle">
          recommendations and endorsements from colleagues, clients, capstone partners, and mentors.
        </p>
      </header>

      {/* ── 1. Live Recommendations Comment Section (Paper Fold/Crumple Animation) ─ */}
      {formVisibility !== 'closed' && (
        <section
          className={`rec-form-section ${
            formVisibility === 'opening'
              ? 'rec-paper-opening'
              : formVisibility === 'closing'
                ? 'rec-paper-closing'
                : 'rec-paper-open'
          }`}
          onAnimationEnd={handleAnimationEnd}
          aria-label="Post your comment"
        >
          {/* Native React 19 Form Action */}
          <form ref={formRef} action={formAction} className="rec-form">
            {/* Hidden Inputs ensuring FormData receives all values on submission */}
            <input type="hidden" name="name" value={formName} />
            <input type="hidden" name="role" value={formRole} />
            <input type="hidden" name="description" value={formComment} />
            <input type="hidden" name="avatarIndex" value={activeAvatarIndex} />

            {/* ── Playing Card Deck Interface ── */}
            <div className="rec-playing-card-deck">
              {/* Visual card stack underlays for true playing card feel */}
              <div className="rec-deck-underlay rec-deck-underlay-2" aria-hidden="true" />
              <div className="rec-deck-underlay rec-deck-underlay-1" aria-hidden="true" />

              {/* Active Card with Deal/Shuffle Animation */}
              <div
                key={currentCard}
                className={`rec-playing-card rec-card-anim-${cardDirection}`}
              >
                {/* ── CARD 1: NAME ── */}
                {currentCard === 1 && (
                  <div className="rec-card-content">
                    <div className="rec-card-input-wrapper">
                      <div className="rec-card-input-box">
                        <input
                          ref={nameInputRef}
                          id="rec-input-name"
                          type="text"
                          className={`rec-input rec-card-input ${activeNameError ? 'has-error' : ''}`}
                          value={formName}
                          maxLength={60}
                          required
                          autoComplete="name"
                          disabled={isActionPending}
                          onBlur={handleNameBlur}
                          onChange={handleNameChange}
                          onKeyDown={handleNameKeyDown}
                          placeholder="Your Full Name"
                          aria-label="Your Full Name"
                          aria-invalid={Boolean(activeNameError)}
                          aria-describedby={activeNameError ? 'rec-name-error' : undefined}
                        />
                        <button
                          type="button"
                          className={`rec-input-continue-btn ${formName.trim().length >= 2 ? 'is-ready' : ''}`}
                          onClick={goToNextCard}
                          disabled={isActionPending}
                          aria-label="Continue"
                          title="Continue (Enter)"
                        >
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                      {activeNameError && (
                        <span id="rec-name-error" className="rec-field-error" role="alert">
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>{activeNameError}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARD 2: ROLE ── */}
                {currentCard === 2 && (
                  <div className="rec-card-content">
                    <button
                      type="button"
                      className="rec-card-close-btn"
                      onClick={goToPrevCard}
                      style={{ alignSelf: 'flex-start', marginLeft: '-4px' }}
                      aria-label="Go Back"
                    >
                      <ArrowLeft size={15} aria-hidden="true" />
                    </button>
                    <div className="rec-card-input-wrapper">
                      <div className="rec-card-input-box">
                        <input
                          ref={roleInputRef}
                          id="rec-input-role"
                          type="text"
                          list="rec-verified-roles-list"
                          className={`rec-input rec-card-input ${activeRoleError ? 'has-error' : ''}`}
                          value={formRole}
                          maxLength={120}
                          required
                          autoComplete="organization-title"
                          disabled={isActionPending}
                          onBlur={handleRoleBlur}
                          onChange={handleRoleChange}
                          onKeyDown={handleRoleKeyDown}
                          placeholder="Your Role"
                          aria-label="Your Role"
                          aria-invalid={Boolean(activeRoleError)}
                          aria-describedby={activeRoleError ? 'rec-role-error' : undefined}
                        />
                        <button
                          type="button"
                          className={`rec-input-continue-btn ${formRole.trim().length >= 2 ? 'is-ready' : ''}`}
                          onClick={goToNextCard}
                          disabled={isActionPending}
                          aria-label="Continue"
                          title="Continue (Enter)"
                        >
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                      <datalist id="rec-verified-roles-list">
                        {VERIFIED_ROLES.map((role) => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                      {activeRoleError && (
                        <span id="rec-role-error" className="rec-field-error" role="alert">
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>{activeRoleError}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARD 3: COMMENT ── */}
                {currentCard === 3 && (
                  <div className="rec-card-content">
                    <button
                      type="button"
                      className="rec-card-close-btn"
                      onClick={goToPrevCard}
                      style={{ alignSelf: 'flex-start', marginLeft: '-4px' }}
                      aria-label="Go Back"
                    >
                      <ArrowLeft size={15} aria-hidden="true" />
                    </button>
                    <div className="rec-card-input-wrapper">
                      <div className="rec-card-input-box">
                        <textarea
                          ref={commentInputRef}
                          id="rec-input-desc"
                          className={`rec-textarea rec-card-textarea ${activeDescError ? 'has-error' : ''}`}
                          value={formComment}
                          maxLength={50000}
                          rows={5}
                          placeholder="Your Recommendation"
                          aria-label="Your Recommendation"
                          required
                          disabled={isActionPending}
                          onBlur={handleCommentBlur}
                          onChange={handleCommentChange}
                          onKeyDown={handleCommentKeyDown}
                          aria-invalid={Boolean(activeDescError)}
                          aria-describedby={activeDescError ? 'rec-desc-error' : undefined}
                        />
                        <button
                          type="button"
                          className={`rec-input-continue-btn ${formComment.trim().length >= 5 ? 'is-ready' : ''}`}
                          onClick={goToNextCard}
                          disabled={isActionPending}
                          style={{ top: 'auto', bottom: '12px', transform: 'none' }}
                          aria-label="Continue"
                          title="Continue (Ctrl/Cmd + Enter)"
                        >
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                      {activeDescError && (
                        <span id="rec-desc-error" className="rec-field-error" role="alert">
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>{activeDescError}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARD 4: POST (REVIEW & SUBMIT - NO AVATAR SELECTION) ── */}
                {currentCard === 4 && (
                  <div className="rec-card-content">
                    <button
                      type="button"
                      className="rec-card-close-btn"
                      onClick={goToPrevCard}
                      disabled={isActionPending}
                      style={{ alignSelf: 'flex-start', marginLeft: '-4px' }}
                      aria-label="Go Back"
                    >
                      <ArrowLeft size={15} aria-hidden="true" />
                    </button>
                    <div className="rec-card-preview-shell">
                      <div className="rec-card-preview-header">
                        <div className="rec-card-preview-avatar-wrap" aria-hidden="true">
                          <img
                            src={getAvatarDataUri(activeAvatarIndex)}
                            alt=""
                            className="rec-card-preview-avatar"
                            width={40}
                            height={40}
                          />
                          <span className="rec-avatar-check-dot" aria-hidden="true" />
                        </div>
                        <div className="rec-card-preview-meta">
                          <span className="rec-card-preview-name">{formName || 'Anonymous'}</span>
                          <span className="rec-card-preview-role">{formRole || 'Endorser'}</span>
                        </div>
                      </div>
                      <div className="rec-card-preview-body">
                        <p className="rec-card-preview-text">
                          {formComment || 'No recommendation comment provided.'}
                        </p>
                      </div>
                    </div>

                    {formState.status === 'error' && (
                      <div className="rec-form-error" role="alert" style={{ marginBottom: 16 }}>
                        <AlertCircle size={16} />
                        <span>{formState.message}</span>
                      </div>
                    )}

                    <div className="rec-form-actions">
                      <button
                        type="submit"
                        className="rec-submit-btn rec-card-submit-btn"
                        disabled={isActionPending}
                        aria-busy={isActionPending}
                      >
                        {isActionPending ? (
                          <>
                            <Loader2 size={15} className="spinning" aria-hidden="true" />
                            <span>Posting live...</span>
                          </>
                        ) : (
                          <span>Post recommendation</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formState.status === 'success' && (
              <div className="rec-form-success" role="status" style={{ marginTop: 16 }}>
                <CheckCircle2 size={16} />
                <span>{formState.message || 'Thank you! Your recommendation was posted live.'}</span>
              </div>
            )}
          </form>
        </section>
      )}

      {/* ── 2. Recommendation Cards Section (Automatic Vertical Expanding Cards) ── */}
      <section className="rec-list-section" aria-label="All recommendations">
        <div className="rec-list-header">
          <h2 className="rec-list-title">
            <span>Community Endorsements</span>
          </h2>
          <span className="rec-count-badge">
            {sortedComments.length} {sortedComments.length === 1 ? 'recommendation' : 'recommendations'}
          </span>
        </div>

        {/* 2a. Query Error State & Resilient Recovery (Aurora Scharff Pattern) */}
        {isQueryError ? (
          <div className="rec-error-state" role="alert" aria-live="assertive">
            <div className="rec-error-icon-wrap" aria-hidden="true">
              <AlertCircle size={28} className="rec-error-icon" />
            </div>
            <div className="rec-error-content">
              <h3 className="rec-error-title">Unable to load recommendations</h3>
              <p className="rec-error-desc">
                {queryError instanceof Error
                  ? queryError.message
                  : 'An error occurred while fetching community endorsements. Check your connection or try again.'}
              </p>
              <button
                type="button"
                className="rec-retry-btn"
                onClick={handleRetry}
                aria-label="Retry loading recommendations"
              >
                <RotateCw size={14} aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : showSkeleton ? (
          /* 2b. Zero-CLS Masonry Skeletons during Initial Data Load */
          <RecommendationsHistorySkeleton columnCount={columnCount} />
        ) : sortedComments.length === 0 ? (
          /* 2c. Interactive Empty State with Call to Action */
          <div className="rec-empty-state" role="status">
            <div className="rec-empty-icon-wrap" aria-hidden="true">
              <MessageSquarePlus size={32} className="rec-empty-icon" />
            </div>
            <h3 className="rec-empty-title">No recommendations yet</h3>
            <p className="rec-empty-desc">
              Be the first to share your endorsement, feedback, or review.
            </p>
            <button
              type="button"
              className="rec-empty-action-btn"
              onClick={() => {
                if (!isFormOpen) {
                  handleToggleForm();
                }
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  const nameInput = formRef.current?.querySelector<HTMLInputElement>('#rec-input-name');
                  nameInput?.focus();
                }, 150);
              }}
              aria-label="Write a recommendation"
            >
              <MessageSquarePlus size={15} aria-hidden="true" />
              <span>Write the first recommendation</span>
            </button>
          </div>
        ) : (
          /* 2d. Rendered Masonry Columns */
          <div className="rec-cards-masonry" role="list">
            {columns.map((colComments, colIdx) => (
              <div key={colIdx} className="rec-cards-col">
                {colComments.map((comment) => {
                  const formattedDate = formatCardDate(comment.date);
                  const isOptimistic = Boolean(comment.isOptimistic);
                  const isExpanded = expandedCardIds.has(comment.id);

                  const words = comment.description.trim().split(/\s+/).filter(Boolean);
                  const wordCount = words.length;
                  const isLongComment = wordCount > 240;

                  let textToRender = comment.description;
                  if (isLongComment && !isExpanded) {
                    textToRender = words.slice(0, 200).join(' ') + '...';
                  }
                  const paragraphs = textToRender.split(/\n\s*\n/).filter(Boolean);

                  return (
                    <div
                      key={comment.id}
                      className={`rec-card-item ${isExpanded ? 'is-expanded' : ''} ${isOptimistic ? 'is-optimistic' : ''}`}
                      role="listitem"
                    >
                      {/* Card Header: Author Profile (Sketch Avatar + Name + Role + Date) & Status */}
                      <div className="rec-card-header">
                        <div className="rec-card-author-wrap">
                          <div className="rec-card-avatar" aria-hidden="true">
                            <img
                              src={getCommentAvatarUri(comment)}
                              alt=""
                              className="rec-card-avatar-img"
                              width={38}
                              height={38}
                              decoding="async"
                            />
                          </div>
                          <div className="rec-card-user-info">
                            <h3 className="rec-card-name">{comment.name}</h3>
                            {comment.role && (
                              <p className="rec-card-role">{comment.role}</p>
                            )}
                            <span className="rec-card-date">{formattedDate}</span>
                          </div>
                        </div>

                        {isOptimistic && (
                          <span className="rec-optimistic-badge" aria-label="Posting in progress">
                            <Loader2 size={11} className="spinning" aria-hidden="true" />
                            <span>Posting...</span>
                          </span>
                        )}
                      </div>

                      {/* Card Body: Recommendation Message */}
                      <div className={`rec-card-body ${isLongComment && !isExpanded ? 'is-clamped' : ''}`}>
                        <div className="rec-card-desc">
                          {paragraphs.map((para, pIdx) => (
                            <p key={pIdx} className="rec-card-paragraph">
                              {para}
                            </p>
                          ))}
                        </div>

                        {/* Expand / Collapse toggle for long comments (1,000–5,000 words) */}
                        {isLongComment && (
                          <button
                            type="button"
                            className="rec-card-read-more-btn"
                            onClick={(e) => toggleCardExpanded(comment.id, e)}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Show less' : `Read full recommendation (${wordCount.toLocaleString()} words)`}
                          >
                            <span>{isExpanded ? 'Show less' : `Read full recommendation (${wordCount.toLocaleString()} words)`}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      <HistoryFooter
        externalUrl="https://github.com/joshuapalero"
        externalText="View on GitHub"
      />
    </article>
  );
}
