/* ========================================
   HEMEDEX WEBSITE — JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // MOBILE MENU
    // ========================================
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav    = document.querySelector('.main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const open = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!open));
            this.classList.toggle('active');
            nav.classList.toggle('active');
            // Lock background scroll while the mobile menu is open
            document.body.style.overflow = open ? '' : 'hidden';
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.site-header') && nav.classList.contains('active')) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close on nav link click (mobile) — but NOT when tapping a dropdown parent toggle
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    // Dropdown parent links are handled separately (they expand, not navigate)
                    if (link.closest('.has-dropdown') && link.classList.contains('nav-link')) return;
                    nav.classList.remove('active');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // Escape key closes menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (toggle) toggle.focus();
        }
    });


    // ========================================
    // STICKY HEADER
    // ========================================
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.pageYOffset > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }


    // ========================================
    // NAV DROPDOWNS (section jump menus)
    // Desktop: CSS :hover handles open/close.
    // Touch/keyboard: tap or Enter on the parent toggles the panel.
    // ========================================
    const dropdownItems = Array.from(document.querySelectorAll('.has-dropdown'));
    if (dropdownItems.length) {
        const isTouchOrMobile = () =>
            window.innerWidth <= 768 ||
            window.matchMedia('(hover: none)').matches;

        const closeAllDropdowns = (except) => {
            dropdownItems.forEach(item => {
                if (item !== except) {
                    item.classList.remove('open');
                    const link = item.querySelector('.nav-link');
                    if (link) link.setAttribute('aria-expanded', 'false');
                }
            });
        };

        dropdownItems.forEach(item => {
            const parentLink = item.querySelector('.nav-link');
            if (!parentLink) return;

            // Tap/click on the parent: on touch or mobile, intercept the first
            // tap to reveal the menu instead of navigating straight to the page.
            parentLink.addEventListener('click', function (e) {
                if (isTouchOrMobile()) {
                    const alreadyOpen = item.classList.contains('open');
                    // First tap opens; allow navigation only once it's open and tapped again.
                    if (!alreadyOpen) {
                        e.preventDefault();
                        closeAllDropdowns(item);
                        item.classList.add('open');
                        parentLink.setAttribute('aria-expanded', 'true');
                    }
                    // If already open, let the click through (navigates to landing page).
                }
            });

            // Keyboard: sync aria-expanded as focus enters/leaves the item.
            item.addEventListener('focusin', () => {
                parentLink.setAttribute('aria-expanded', 'true');
            });
            item.addEventListener('focusout', (e) => {
                // Only collapse if focus actually left this item entirely.
                if (!item.contains(e.relatedTarget)) {
                    parentLink.setAttribute('aria-expanded', 'false');
                    item.classList.remove('open');
                }
            });
        });

        // Desktop hover should keep aria in sync too.
        dropdownItems.forEach(item => {
            const parentLink = item.querySelector('.nav-link');
            if (!parentLink) return;
            item.addEventListener('mouseenter', () => {
                if (!isTouchOrMobile()) parentLink.setAttribute('aria-expanded', 'true');
            });
            item.addEventListener('mouseleave', () => {
                if (!isTouchOrMobile()) parentLink.setAttribute('aria-expanded', 'false');
            });
        });

        // Click outside any dropdown closes the open one (desktop edge cases).
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.has-dropdown')) closeAllDropdowns(null);
        });

        // Escape closes any open dropdown and returns focus to its parent.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openItem = dropdownItems.find(i => i.classList.contains('open'));
                if (openItem) {
                    openItem.classList.remove('open');
                    const link = openItem.querySelector('.nav-link');
                    if (link) {
                        link.setAttribute('aria-expanded', 'false');
                        link.focus();
                    }
                }
            }
        });
    }


    // ========================================
    // SMOOTH SCROLL (anchor links)
    // Handles both bare #anchors and same-page file.html#anchor links
    // (the latter come from the nav dropdowns).
    // ========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        const rawHref = anchor.getAttribute('href');
        if (!rawHref || rawHref === '#' || rawHref === '#main-content') return;

        // Split into path + hash
        const [path, hash] = rawHref.split('#');
        if (!hash) return;

        // Determine if this link targets the current page
        const linkPage = path === '' ? currentPage : path.split('/').pop();
        const isSamePage = linkPage === currentPage;
        if (!isSamePage) return; // let cross-page links navigate normally

        anchor.addEventListener('click', function (e) {
            const target = document.getElementById(hash);
            if (!target) return; // anchor not on this page; let it through
            e.preventDefault();

            // Close mobile menu + any open dropdown before scrolling
            const navEl = document.querySelector('.main-nav');
            const toggleEl = document.querySelector('.mobile-menu-toggle');
            if (navEl && navEl.classList.contains('active')) {
                navEl.classList.remove('active');
                if (toggleEl) {
                    toggleEl.classList.remove('active');
                    toggleEl.setAttribute('aria-expanded', 'false');
                }
                document.body.style.overflow = '';
            }
            document.querySelectorAll('.has-dropdown.open').forEach(i => {
                i.classList.remove('open');
                const l = i.querySelector('.nav-link');
                if (l) l.setAttribute('aria-expanded', 'false');
            });

            const offset = 90;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });

            // Update the URL hash without an extra jump
            history.pushState(null, '', '#' + hash);
        });
    });


    // ========================================
    // SCROLL-TRIGGERED FADE-IN
    // ========================================
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity  = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll(
        '.product-card, .topic-card, ' +
        '.team-member, .event-card, .info-card, .mmm-param-card'
    ).forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
        observer.observe(el);
    });


    // ========================================
    // PUBLICATION FILTERING + SEARCH + LOAD MORE
    // ========================================
    const publications  = Array.from(document.querySelectorAll('.publication-item[data-keywords]'));
    const pubSearchInput = document.getElementById('pub-search');
    const pubSearchCount = document.getElementById('pub-search-count');
    const kwCheckboxes   = Array.from(document.querySelectorAll('#keyword-checkboxes input[type="checkbox"]'));
    const kwClearBtn     = document.getElementById('keyword-clear-btn');
    const loadMoreBtn    = document.getElementById('pub-load-more');
    const loadMoreText   = document.getElementById('pub-load-more-text');
    const loadMoreWrap   = document.getElementById('pub-load-more-wrapper');
    const noResults      = document.getElementById('pub-no-results');
    const totalCountEl   = document.getElementById('pub-total-count');
    const visibleCountEl = document.getElementById('pub-visible-count');
    const sortSelect     = document.getElementById('pub-sort-select');
    const pubsContainer  = document.getElementById('publications-main');
    const selectedToggle = document.getElementById('pub-selected-toggle');

    if (publications.length) {
        const PUB_BATCH = 7;
        let searchQuery = '';
        let activeKeywords = [];   // lowercase keyword strings, AND-combined
        let shownCount = PUB_BATCH;
        let sortMode = sortSelect ? (sortSelect.value || 'newest') : 'newest';
        let selectedOnly = false;  // "Selected Literature" toggle

        // Pre-parse each publication's searchable text + keyword set once.
        // origIndex preserves the authored (newest-first) order as a stable tiebreaker.
        const pubData = publications.map((pub, i) => {
            const title = (pub.querySelector('.pub-title') || {}).textContent || '';
            const citation = (pub.querySelector('.pub-citation') || {}).textContent || '';
            const year = (pub.querySelector('.pub-year') || {}).textContent || '';
            const kws = (pub.dataset.keywords || '')
                .split(';')
                .map(s => s.trim())
                .filter(Boolean);
            // Per-keyword mention counts: "keyword:count;keyword:count" (keys never contain ':')
            const counts = {};
            (pub.dataset.kwcounts || '').split(';').forEach(pair => {
                const idx = pair.lastIndexOf(':');
                if (idx === -1) return;
                const k = pair.slice(0, idx).trim();
                const v = parseInt(pair.slice(idx + 1), 10);
                if (k) counts[k] = isNaN(v) ? 0 : v;
            });
            return {
                el: pub,
                origIndex: i,
                year: parseInt(pub.dataset.year, 10) || 0,
                citations: parseInt(pub.dataset.citations, 10),
                selected: pub.dataset.selected === 'true',
                haystack: (title + ' ' + citation + ' ' + year).toLowerCase(),
                keywords: kws,
                counts: counts
            };
        });

        // Map each keyword value -> its human label (for the mention chips).
        const kwLabelMap = {};
        kwCheckboxes.forEach(cb => {
            const lbl = cb.closest('.keyword-chip') &&
                        cb.closest('.keyword-chip').querySelector('.kw-label');
            kwLabelMap[cb.value] = lbl ? lbl.textContent.trim() : cb.value;
        });

        if (totalCountEl) totalCountEl.textContent = publications.length;

        // A pub matches when it satisfies the search AND contains EVERY active keyword.
        function matches(data) {
            if (selectedOnly && !data.selected) return false;
            if (searchQuery && !data.haystack.includes(searchQuery)) return false;
            for (const kw of activeKeywords) {
                if (!data.keywords.includes(kw)) return false;
            }
            return true;
        }

        // Live keyword counts: for each keyword, how many CURRENTLY-matching papers
        // would still match if that keyword were also required. Counts reflect the
        // active search + other ticked keywords, so they update as you filter.
        function updateKeywordCounts(matchingData) {
            kwCheckboxes.forEach(cb => {
                const kw = cb.value;
                const chip = cb.closest('.keyword-chip');
                const countEl = chip.querySelector('.kw-count');
                let n = 0;
                for (const d of matchingData) {
                    if (d.keywords.includes(kw)) n++;
                }
                if (countEl) countEl.textContent = n;
                // Disable keywords that would yield nothing (unless already checked).
                if (n === 0 && !cb.checked) {
                    chip.classList.add('is-empty');
                    cb.disabled = true;
                } else {
                    chip.classList.remove('is-empty');
                    cb.disabled = false;
                }
            });
        }

        function applyFilters() {
            const matching = pubData.filter(matches);

            // Reveal up to shownCount matching items; hide the rest.
            let revealed = 0;
            pubData.forEach(d => {
                const isMatch = matching.includes(d);
                if (isMatch && revealed < shownCount) {
                    d.el.hidden = false;
                    revealed++;
                    renderMentions(d);
                } else {
                    d.el.hidden = true;
                    const host = d.el.querySelector('.pub-mentions');
                    if (host) host.remove();
                }
            });

            // No-results message
            if (noResults) noResults.hidden = matching.length !== 0;

            // Counters
            if (visibleCountEl) visibleCountEl.textContent = revealed;
            if (totalCountEl) totalCountEl.textContent = matching.length;

            // Load More button state
            const remaining = matching.length - revealed;
            if (loadMoreWrap) loadMoreWrap.hidden = remaining <= 0;
            if (loadMoreText) {
                loadMoreText.textContent = 'Show More (' + remaining + ' remaining)';
            }

            // Search/filter feedback line
            if (pubSearchCount) {
                if (searchQuery || activeKeywords.length) {
                    pubSearchCount.textContent =
                        matching.length + ' result' + (matching.length !== 1 ? 's' : '') + ' found';
                } else {
                    pubSearchCount.textContent = '';
                }
            }

            // Clear button visibility
            if (kwClearBtn) kwClearBtn.hidden = activeKeywords.length === 0;

            // Refresh the per-keyword tallies
            updateKeywordCounts(matching);

            // Reflect relevance mode in the Sort control
            updateSortUI();
        }

        // Search (debounced)
        if (pubSearchInput) {
            let debounceTimer;
            pubSearchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    searchQuery = this.value.toLowerCase().trim();
                    shownCount = PUB_BATCH;
                    applyFilters();
                }, 200);
            });
        }

        // Keyword checkboxes (AND-combined)
        kwCheckboxes.forEach(cb => {
            cb.addEventListener('change', function () {
                activeKeywords = kwCheckboxes
                    .filter(c => c.checked)
                    .map(c => c.value);
                // Changing the keyword filter auto-switches to relevance, but the
                // dropdown stays free — the user can pick another sort afterward.
                if (activeKeywords.length) sortMode = 'relevance';
                else if (sortMode === 'relevance') sortMode = 'newest';
                shownCount = PUB_BATCH;
                sortPublications();
                applyFilters();
            });
        });

        if (kwClearBtn) {
            kwClearBtn.addEventListener('click', function () {
                kwCheckboxes.forEach(c => { c.checked = false; });
                activeKeywords = [];
                if (sortMode === 'relevance') sortMode = 'newest';
                shownCount = PUB_BATCH;
                sortPublications();   // revert to the Sort-by dropdown order
                applyFilters();
            });
        }

        // Load More
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function () {
                shownCount += PUB_BATCH;
                applyFilters();
            });
        }

        // Allow deep-linking to a single keyword, e.g. publications.html#cbf maps by value match
        const hash = decodeURIComponent(window.location.hash.replace('#', '')).toLowerCase();
        if (hash) {
            const target = kwCheckboxes.find(c =>
                c.value === hash || c.value.replace(/[^a-z]/g, '') === hash.replace(/[^a-z]/g, '')
            );
            if (target) {
                target.checked = true;
                activeKeywords = [target.value];
                sortMode = 'relevance';   // deep-linked keyword opens in relevance order
            }
        }

        // Relevance score = total mentions of the active keyword(s) in a paper.
        function relevanceScore(d) {
            let s = 0;
            for (const kw of activeKeywords) s += (d.counts[kw] || 0);
            return s;
        }

        // Reorder pubData (in place) + the DOM to match the chosen sort mode
        // (newest / oldest / selected / relevance). Selecting a keyword filter
        // auto-sets sortMode to 'relevance', but the dropdown can override it.
        // The no-results message and Load More button are kept last.
        function sortPublications() {
            pubData.sort((a, b) => {
                if (sortMode === 'relevance') {
                    return (relevanceScore(b) - relevanceScore(a))
                        || (b.year - a.year)
                        || (a.origIndex - b.origIndex);
                }
                if (sortMode === 'oldest') {
                    return (a.year - b.year) || (a.origIndex - b.origIndex);
                }
                if (sortMode === 'citations') {
                    // Most-cited first. Entries with an unknown count (-1 / NaN)
                    // sort to the bottom; ties broken by newest, then authored order.
                    const ca = isNaN(a.citations) ? -1 : a.citations;
                    const cb = isNaN(b.citations) ? -1 : b.citations;
                    return (cb - ca) || (b.year - a.year) || (a.origIndex - b.origIndex);
                }
                if (sortMode === 'selected') {
                    // Hemedex's curated picks first, then newest within each group.
                    return (Number(b.selected) - Number(a.selected))
                        || (b.year - a.year)
                        || (a.origIndex - b.origIndex);
                }
                // 'newest' (default)
                return (b.year - a.year) || (a.origIndex - b.origIndex);
            });
            if (pubsContainer) {
                pubData.forEach(d => pubsContainer.appendChild(d.el));
                if (noResults)    pubsContainer.appendChild(noResults);
                if (loadMoreWrap) pubsContainer.appendChild(loadMoreWrap);
            }
        }

        // Show/update per-keyword mention chips on a card (or remove them when no
        // keyword filters are active).
        function renderMentions(d) {
            let host = d.el.querySelector('.pub-mentions');
            if (!activeKeywords.length) {
                if (host) host.remove();
                return;
            }
            if (!host) {
                host = document.createElement('div');
                host.className = 'pub-mentions';
                const content = d.el.querySelector('.pub-content') || d.el;
                const link = content.querySelector('.pub-link');
                content.insertBefore(host, link || null);
            }
            let total = 0;
            let chips = '<span class="pub-mentions-label">Mentions</span>';
            activeKeywords.forEach(kw => {
                const c = d.counts[kw] || 0;
                total += c;
                chips += '<span class="pub-mention"><span class="pub-mention-kw">' +
                         (kwLabelMap[kw] || kw) + '</span><span class="pub-mention-n">' +
                         c + '</span></span>';
            });
            if (activeKeywords.length > 1) {
                chips += '<span class="pub-mention pub-mention-total"><span class="pub-mention-kw">Total</span>' +
                         '<span class="pub-mention-n">' + total + '</span></span>';
            }
            host.innerHTML = chips;
        }

        // Keep the Sort control in sync. "Relevance" is offered as a real,
        // selectable option only while keyword filters are active (it needs a
        // keyword to score). Selecting keywords auto-picks it, but the user can
        // freely switch to Newest / Oldest / Selected — the dropdown is never
        // disabled.
        function updateSortUI() {
            if (!sortSelect) return;
            const relevanceAvailable = activeKeywords.length > 0;
            let opt = sortSelect.querySelector('option[value="relevance"]');
            if (relevanceAvailable && !opt) {
                opt = document.createElement('option');
                opt.value = 'relevance';
                opt.textContent = 'Relevance';
                sortSelect.insertBefore(opt, sortSelect.firstChild);
            } else if (!relevanceAvailable && opt) {
                opt.remove();
            }
            sortSelect.value = sortMode;
            sortSelect.title = relevanceAvailable
                ? 'Auto-sorted by relevance (mention counts) — pick another option to override.'
                : 'Sort the publication list.';
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                sortMode = this.value;
                shownCount = PUB_BATCH;
                sortPublications();
                applyFilters();
            });
        }

        // "Selected Literature" toggle — shows only Hemedex's curated picks.
        if (selectedToggle) {
            selectedToggle.addEventListener('click', function () {
                selectedOnly = !selectedOnly;
                this.setAttribute('aria-pressed', selectedOnly ? 'true' : 'false');
                shownCount = PUB_BATCH;
                applyFilters();
            });
        }

        // Initial render
        sortPublications();
        applyFilters();
    }


    // ========================================
    // FAQ ACCORDION
    // ========================================
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = this.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            
            // Close all siblings in the same FAQ section
            const parent = item.closest('.product-faq');
            if (parent) {
                parent.querySelectorAll('.faq-item.open').forEach(openItem => {
                    if (openItem !== item) {
                        openItem.classList.remove('open');
                        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    }
                });
            }
            
            item.classList.toggle('open', !isOpen);
            this.setAttribute('aria-expanded', String(!isOpen));
        });
    });


    // ========================================
    // CONTACT FORM — Web3Forms submission
    // ========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const origHTML = btn.innerHTML;

            // Loading state
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…';
            btn.disabled = true;
            btn.style.opacity = '0.85';

            const formData = new FormData(contactForm);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                btn.innerHTML = origHTML;
                btn.disabled = false;
                btn.style.opacity = '';

                const msg = document.createElement('div');

                if (data.success) {
                    msg.style.cssText = `
                        background: linear-gradient(135deg, #059669, #047857);
                        color: white; padding: 1.25rem 1.75rem; border-radius: 12px;
                        margin-top: 1.5rem; font-weight: 600; font-size: 0.9375rem;
                        display: flex; align-items: center; gap: 0.75rem;
                        box-shadow: 0 4px 20px rgba(5,150,105,0.25);
                        transition: opacity 0.4s ease;
                    `;
                    msg.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Message sent! We'll be in touch within 24 hours.`;
                    contactForm.reset();
                } else {
                    msg.style.cssText = `
                        background: linear-gradient(135deg, #dc2626, #b91c1c);
                        color: white; padding: 1.25rem 1.75rem; border-radius: 12px;
                        margin-top: 1.5rem; font-weight: 600; font-size: 0.9375rem;
                        display: flex; align-items: center; gap: 0.75rem;
                        box-shadow: 0 4px 20px rgba(220,38,38,0.25);
                        transition: opacity 0.4s ease;
                    `;
                    msg.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Something went wrong. Please try again or call us directly.`;
                }

                contactForm.appendChild(msg);
                msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                setTimeout(() => {
                    msg.style.opacity = '0';
                    setTimeout(() => msg.remove(), 400);
                }, 5500);
            })
            .catch(() => {
                btn.innerHTML = origHTML;
                btn.disabled = false;
                btn.style.opacity = '';

                const msg = document.createElement('div');
                msg.style.cssText = `
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white; padding: 1.25rem 1.75rem; border-radius: 12px;
                    margin-top: 1.5rem; font-weight: 600; font-size: 0.9375rem;
                    display: flex; align-items: center; gap: 0.75rem;
                    box-shadow: 0 4px 20px rgba(220,38,38,0.25);
                    transition: opacity 0.4s ease;
                `;
                msg.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Network error. Please check your connection and try again.`;
                contactForm.appendChild(msg);
                msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                setTimeout(() => {
                    msg.style.opacity = '0';
                    setTimeout(() => msg.remove(), 400);
                }, 5500);
            });
        });

        // Floating label effect
        contactForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => {
                field.classList.toggle('has-value', field.value.trim() !== '');
            });
        });
    }


    // ========================================
    // IMAGE LIGHTBOX — Click to expand
    // ========================================
    (function () {
        const imgWraps = document.querySelectorAll('.product-inline-img-wrap');
        if (!imgWraps.length) return;

        // Create overlay once
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close image">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <img src="" alt="">
            <div class="lightbox-caption"></div>
        `;
        document.body.appendChild(overlay);

        const lbImg = overlay.querySelector('img');
        const lbCaption = overlay.querySelector('.lightbox-caption');

        function openLightbox(src, alt, caption) {
            lbImg.src = src;
            lbImg.alt = alt;
            lbCaption.textContent = caption || alt;
            lbCaption.style.display = caption || alt ? '' : 'none';
            document.body.style.overflow = 'hidden';
            overlay.style.display = 'flex';
            // Trigger transition
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        }

        function closeLightbox() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            overlay.addEventListener('transitionend', function handler() {
                overlay.style.display = 'none';
                overlay.removeEventListener('transitionend', handler);
            });
        }

        // Click handlers on each image wrap
        imgWraps.forEach(wrap => {
            wrap.addEventListener('click', function () {
                const img = this.querySelector('img');
                if (!img) return;
                const caption = this.querySelector('.product-inline-caption');
                openLightbox(img.src, img.alt, caption ? caption.textContent : '');
            });
        });

        // Close on overlay click, close button, or Escape
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('.lightbox-close')) {
                closeLightbox();
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeLightbox();
            }
        });

        // Hide initially
        overlay.style.display = 'none';
    })();


    // ========================================
    // PARALLAX (hero & CTA backgrounds)
    // ========================================
    const heroBg = document.querySelector('.hero-bg-img');
    const ctaBg  = document.querySelector('.cta-bg-img');

    if (heroBg || ctaBg) {
        window.addEventListener('scroll', () => {
            const y = window.pageYOffset;
            if (heroBg) heroBg.style.transform = `translateY(${y * 0.35}px) scale(1.1)`;
            if (ctaBg)  {
                const sec = ctaBg.closest('section');
                if (sec) {
                    const dy = (y - sec.offsetTop) * 0.25;
                    ctaBg.style.transform = `translateY(${dy}px) scale(1.1)`;
                }
            }
        }, { passive: true });
    }


    // ========================================
    // BUTTON RIPPLE
    // ========================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const r = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            r.style.cssText = `
                position:absolute; border-radius:50%; pointer-events:none;
                width:${size}px; height:${size}px;
                left:${e.clientX - rect.left - size / 2}px;
                top:${e.clientY - rect.top - size / 2}px;
                background:rgba(255,255,255,0.4);
                transform:scale(0);
                animation:ripple 0.55s ease-out forwards;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(r);
            setTimeout(() => r.remove(), 600);
        });
    });


});


// ========================================
// INJECT STYLES (ripple + spin)
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);


// ========================================
// PAGE VISIBILITY — pause carousel
// ========================================
document.addEventListener('visibilitychange', () => {
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.animationPlayState = document.hidden ? 'paused' : 'running';
    }
});


// ========================================
// CONSOLE TAG
// ========================================
console.log('%c🩺 Hemedex', 'font-size:18px;font-weight:700;color:#3852b3;');
console.log('%cKnow The Flow™', 'font-size:12px;color:#4c5166;');


// ========================================
// YOUTUBE LITE FACADE — click to load
// ========================================
document.querySelectorAll('.yt-facade').forEach(facade => {
    const load = () => {
        if (facade.classList.contains('playing')) return;
        const id = facade.dataset.videoid;
        if (!id) return;
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.title = facade.querySelector('img')?.alt || 'YouTube video';
        facade.appendChild(iframe);
        facade.classList.add('playing');
    };

    facade.addEventListener('click', e => {
        // Don't intercept the "Watch on YouTube" fallback link
        if (e.target.closest('.yt-fallback-link a')) return;
        load();
    });

    facade.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            load();
        }
    });
});