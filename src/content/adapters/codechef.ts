import { SiteAdapter } from "./base";

export class CodeChefAdapter extends SiteAdapter {
  name = "codechef";

  matchUrl(url: string): boolean {
    return url.includes("codechef.com") && (url.includes("/problems/") || url.includes("/submit/"));
  }

  getProblemTitle(): string | null {
    // Try standard header first
    let title = document.querySelector("h1")?.textContent;
    
    // Fallback: Try the breadcrumb or title metadata
    if (!title) {
        const titleElement = document.querySelector("div[class*='problem-title']");
        title = titleElement?.textContent;
    }
    
    return title?.trim() || "CodeChef Problem";
  }

  getProblemTags(): string[] {
    // CodeChef tags are often at the bottom
    const tagLinks = document.querySelectorAll("a[href*='/tags/problems/']");
    return Array.from(tagLinks).map(el => el.textContent?.trim() || "").slice(0, 3);
  }

  isSuccessState(): boolean {
    const text = document.body.innerText;
    
    // Check 1: The specific text at the bottom of the table (from your screenshot)
    if (text.includes("Result - Correct") || text.includes("Result - AC")) return true;

    // Check 2: The Green Success Banner (New UI)
    if (document.querySelector("div[class*='StatusLabel__success']")) return true;

    // Check 3: Standard "Correct Answer" text (relaxed check)
    return text.includes("Correct Answer") && !text.includes("Wrong Answer");
  }
}