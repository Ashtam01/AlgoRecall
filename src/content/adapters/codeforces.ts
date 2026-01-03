import { SiteAdapter } from "./base";

export class CodeforcesAdapter extends SiteAdapter {
  name = "codeforces";

  matchUrl(url: string): boolean {
    return url.includes("codeforces.com") && (url.includes("/problem/") || url.includes("/problemset/problem"));
  }

  getProblemTitle(): string | null {
    const titleElement = document.querySelector(".problem-statement .header .title");
    return titleElement ? titleElement.textContent?.trim() || "Unknown Problem" : null;
  }

  isSuccessState(): boolean {
    // 1. Sidebar check
    const sidebar = document.querySelector("#sidebar");
    if (sidebar?.querySelector(".verdict-accepted")) return true;

    // 2. Contest submission check
    return !!document.querySelector("span.verdict-accepted");
  }

  // NEW: Scrape tags from sidebar
  getProblemTags(): string[] {
    const tagElements = document.querySelectorAll(".tag-box");
    return Array.from(tagElements)
      .map(el => el.textContent?.trim() || "")
      .filter(t => t.length > 0 && !t.includes("*")); // Filter out empty or rating tags (like *1200)
  }
}