import { SiteAdapter } from "./base";

export class LeetCodeAdapter extends SiteAdapter {
  name = "leetcode";

  matchUrl(url: string): boolean {
    return url.includes("leetcode.com/problems/");
  }

  getProblemTitle(): string | null {
    // 1. Try the standard data attribute (most reliable)
    const titleEl = document.querySelector("[data-cy='question-title']");
    if (titleEl) return titleEl.textContent?.trim() || null;

    // 2. Fallback to document title (e.g. "Two Sum - LeetCode")
    return document.title.split('-')[0].trim();
  }

  getProblemTags(): string[] {
    // LeetCode hides tags by default in a "Topics" dropdown.
    // We try to find them if the user has expanded them, or look for the pill elements.
    // Note: LeetCode classes change often, so this is "best effort".
    
    // Look for topic chips (often links under /tag/)
    const tagLinks = document.querySelectorAll("a[href^='/tag/']");
    if (tagLinks.length > 0) {
        return Array.from(tagLinks)
          .map(el => el.textContent?.trim() || "")
          .filter(t => t.length > 0);
    }
    
    return [];
  }

  isSuccessState(): boolean {
    // Only detect SUBMISSION success, not test case success.
    // Key difference: Submissions show "Submitted" timestamp and percentile stats.
    
    // 1. Check for submission result with "Accepted" status
    const resultHeader = document.querySelector("[data-e2e-locator='submission-result']");
    if (resultHeader) {
        const text = resultHeader.textContent || "";
        if (text.includes("Accepted")) {
            // Verify it's a real submission by checking for submission-specific elements
            // Submissions show "Submitted" timestamp or percentile ("Beats X%")
            const bodyText = document.body.innerText;
            const hasSubmissionIndicators = 
                bodyText.includes("Beats") || 
                bodyText.includes("Submitted") ||
                bodyText.includes("faster than") ||
                bodyText.includes("less memory than");
            return hasSubmissionIndicators;
        }
    }

    // 2. Check for the submission detail page URL pattern
    // When viewing a past submission: /submissions/detail/
    if (window.location.href.includes("/submissions/")) {
        const bodyText = document.body.innerText;
        return bodyText.includes("Accepted") && bodyText.includes("Beats");
    }

    // 3. Final fallback: Look for the combination that ONLY appears after submission
    // Must have: Accepted + Runtime + Memory + (Beats OR Submitted)
    const bodyText = document.body.innerText;
    const isSubmission = 
        bodyText.includes("Accepted") && 
        bodyText.includes("Runtime") && 
        bodyText.includes("Memory") &&
        (bodyText.includes("Beats") || bodyText.includes("Submitted"));
    
    return isSubmission;
  }
}